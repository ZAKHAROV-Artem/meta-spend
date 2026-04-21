import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Prisma, SyncStatus } from '@crypto-tracker/db';
import { PrismaService } from '../../prisma/prisma.service';
import { EtherscanService, EtherscanTokenTx, EtherscanTx } from './etherscan.service';
import { NormalizerService } from './normalizer.service';
import { PriceService } from './price.service';

const USD_STABLECOIN_SYMBOLS = new Set(['MUSD', 'AMUSD', 'USDC', 'USDT', 'USDC.E', 'USDT0', 'DAI']);
const ETH_LIKE_SYMBOLS = new Set(['ETH', 'WETH']);

function formatUnits(value: string, decimals: number): string {
  const normalized = value.replace(/^0+/, '') || '0';
  if (decimals === 0) {
    return normalized;
  }

  const padded = normalized.padStart(decimals + 1, '0');
  const whole = padded.slice(0, -decimals) || '0';
  const fraction = padded.slice(-decimals).replace(/0+$/, '');
  return fraction ? `${whole}.${fraction}` : whole;
}

function pickPrimaryTokenTransfer(walletAddress: string, tokenTransfers: EtherscanTokenTx[]): EtherscanTokenTx | null {
  const wallet = walletAddress.toLowerCase();

  return (
    tokenTransfers.find((transfer) => transfer.from.toLowerCase() === wallet) ??
    tokenTransfers.find((transfer) => transfer.to.toLowerCase() === wallet) ??
    tokenTransfers[0] ??
    null
  );
}

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);
  private walletSyncColumnsAvailablePromise?: Promise<boolean>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly etherscanService: EtherscanService,
    private readonly normalizerService: NormalizerService,
    private readonly priceService: PriceService,
  ) {}

  async syncWallet(userId: string, walletId: string): Promise<{ synced: number }> {
    await this.ensureWalletSyncColumns();

    const wallet = await this.prisma.wallet.findFirst({
      where: { id: walletId, userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const startBlock = wallet.lastSyncedBlock !== null ? wallet.lastSyncedBlock + 1n : 0n;

    await this.prisma.wallet.update({
      where: { id: wallet.id },
      data: { syncStatus: SyncStatus.SYNCING },
    });

    try {
      const [normalTxs, tokenTxs] = await Promise.all([
        this.etherscanService.fetchNormalTxs(wallet.address, wallet.chainId, startBlock),
        this.etherscanService.fetchTokenTxs(wallet.address, wallet.chainId, startBlock),
      ]);

      const tokenTxsByHash = tokenTxs.reduce<Record<string, typeof tokenTxs>>((acc, tx) => {
        const key = tx.hash.toLowerCase();
        acc[key] ??= [];
        acc[key].push(tx);
        return acc;
      }, {});

      let latestBlock = wallet.lastSyncedBlock;
      const savedHashes = new Set<string>();

      for (const tx of normalTxs) {
        const hashKey = tx.hash.toLowerCase();
        const tokenTransfers = tokenTxsByHash[hashKey] ?? [];
        await this.upsertTransaction(wallet.id, wallet.address, wallet.chainId, tx, tokenTransfers);
        savedHashes.add(hashKey);

        const blockNumber = BigInt(tx.blockNumber);
        if (latestBlock === null || blockNumber > latestBlock) {
          latestBlock = blockNumber;
        }
      }

      // Persist token-only transactions (e.g. contract-initiated `transferFrom`
      // flows like MetaMask Card / Baanx). The txlist endpoint never surfaces
      // these because neither `from` nor `to` on the underlying tx is the
      // wallet address, but tokentx captures the ERC-20 Transfer event.
      let tokenOnlySynced = 0;
      for (const [hashKey, transfers] of Object.entries(tokenTxsByHash)) {
        if (savedHashes.has(hashKey)) continue;
        const primary = pickPrimaryTokenTransfer(wallet.address, transfers) ?? transfers[0];
        if (!primary) continue;

        const stub: EtherscanTx = {
          blockNumber: primary.blockNumber,
          timeStamp: primary.timeStamp,
          hash: primary.hash,
          nonce: primary.nonce,
          blockHash: primary.blockHash,
          transactionIndex: primary.transactionIndex,
          from: primary.from,
          to: primary.to,
          value: '0',
          gas: primary.gas,
          gasPrice: primary.gasPrice,
          input: '0x',
          contractAddress: primary.contractAddress,
          cumulativeGasUsed: primary.cumulativeGasUsed,
          gasUsed: primary.gasUsed,
          confirmations: primary.confirmations,
        };

        await this.upsertTransaction(wallet.id, wallet.address, wallet.chainId, stub, transfers);
        tokenOnlySynced += 1;

        const blockNumber = BigInt(primary.blockNumber);
        if (latestBlock === null || blockNumber > latestBlock) {
          latestBlock = blockNumber;
        }
      }

      await this.prisma.wallet.update({
        where: { id: wallet.id },
        data: {
          lastSyncedAt: new Date(),
          lastSyncedBlock: latestBlock,
          syncStatus: SyncStatus.IDLE,
        },
      });

      return { synced: normalTxs.length + tokenOnlySynced };
    } catch (error) {
      await this.prisma.wallet.update({
        where: { id: wallet.id },
        data: { syncStatus: SyncStatus.FAILED },
      });

      this.logger.error(`Wallet sync failed for ${wallet.id}`, error instanceof Error ? error.stack : undefined);

      if (error instanceof NotFoundException || error instanceof InternalServerErrorException) {
        throw error;
      }

      throw new InternalServerErrorException('Wallet sync failed');
    }
  }

  private async ensureWalletSyncColumns(): Promise<void> {
    const hasColumns = await this.hasWalletSyncColumns();
    if (!hasColumns) {
      throw new ServiceUnavailableException(
        'Wallet sync requires the latest database migration. Run `pnpm db:migrate` and restart the API.',
      );
    }
  }

  private async hasWalletSyncColumns(): Promise<boolean> {
    if (!this.walletSyncColumnsAvailablePromise) {
      this.walletSyncColumnsAvailablePromise = this.prisma
        .$queryRaw<Array<{ exists: boolean }>>(Prisma.sql`
          SELECT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'wallets'
              AND column_name = 'lastSyncedAt'
          ) AS "exists"
        `)
        .then((rows) => rows[0]?.exists ?? false)
        .catch(() => false);
    }

    return this.walletSyncColumnsAvailablePromise;
  }

  private async upsertTransaction(
    walletId: string,
    walletAddress: string,
    chainId: number,
    tx: EtherscanTx,
    tokenTransfers: EtherscanTokenTx[],
  ): Promise<void> {
    const date = new Date(Number(tx.timeStamp) * 1000);
    const dateKey = date.toISOString().slice(0, 10);
    const usdPrice = await this.priceService.getUsdPrice(chainId, dateKey);
    const primaryTokenTransfer = pickPrimaryTokenTransfer(walletAddress, tokenTransfers);

    const txType = this.normalizerService.classify(tx, walletAddress, tokenTransfers);
    const nativeValue = formatUnits(tx.value, 18);
    const assetValue = primaryTokenTransfer
      ? formatUnits(primaryTokenTransfer.value, Number(primaryTokenTransfer.tokenDecimal || '18'))
      : nativeValue;
    const gasPriceGwei = formatUnits(tx.gasPrice, 9);
    const gasCostNative = formatUnits((BigInt(tx.gasUsed || '0') * BigInt(tx.gasPrice || '0')).toString(), 18);
    const rawData = JSON.parse(
      JSON.stringify({
        normalTx: tx,
        tokenTransfers,
      }),
    ) as Prisma.InputJsonValue;

    const valueUsd = this.getValueUsd(primaryTokenTransfer, assetValue, usdPrice);

    const gasCostUsd =
      usdPrice === null
        ? null
        : new Prisma.Decimal(gasCostNative).mul(usdPrice).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);

    await this.prisma.transaction.upsert({
      where: {
        hash_chainId: {
          hash: tx.hash.toLowerCase(),
          chainId,
        },
      },
      create: {
        walletId,
        hash: tx.hash.toLowerCase(),
        chainId,
        blockNumber: BigInt(tx.blockNumber),
        timestamp: date,
        fromAddress: tx.from.toLowerCase(),
        toAddress: tx.to ? tx.to.toLowerCase() : null,
        value: new Prisma.Decimal(assetValue),
        valueUsd,
        gasUsed: tx.gasUsed ? BigInt(tx.gasUsed) : null,
        gasPriceGwei: new Prisma.Decimal(gasPriceGwei),
        gasCostUsd,
        txType,
        rawData,
      },
      update: {
        walletId,
        blockNumber: BigInt(tx.blockNumber),
        timestamp: date,
        fromAddress: tx.from.toLowerCase(),
        toAddress: tx.to ? tx.to.toLowerCase() : null,
        value: new Prisma.Decimal(assetValue),
        valueUsd,
        gasUsed: tx.gasUsed ? BigInt(tx.gasUsed) : null,
        gasPriceGwei: new Prisma.Decimal(gasPriceGwei),
        gasCostUsd,
        txType,
        rawData,
      },
    });
  }

  private getValueUsd(
    tokenTransfer: EtherscanTokenTx | null,
    assetValue: string,
    nativeUsdPrice: number | null,
  ): Prisma.Decimal | null {
    if (tokenTransfer) {
      const tokenSymbol = tokenTransfer.tokenSymbol.toUpperCase();

      if (USD_STABLECOIN_SYMBOLS.has(tokenSymbol)) {
        return new Prisma.Decimal(assetValue).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
      }

      if (nativeUsdPrice !== null && ETH_LIKE_SYMBOLS.has(tokenSymbol)) {
        return new Prisma.Decimal(assetValue)
          .mul(nativeUsdPrice)
          .toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
      }

      return null;
    }

    if (nativeUsdPrice === null) {
      return null;
    }

    return new Prisma.Decimal(assetValue)
      .mul(nativeUsdPrice)
      .toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
  }
}
