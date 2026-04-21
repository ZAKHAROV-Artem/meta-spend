import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, SyncStatus } from '@crypto-tracker/db';
import { randomUUID } from 'crypto';
import {
  PortfolioHolding,
  PortfolioOverview,
  PortfolioSyncState,
  PortfolioSyncStatus,
  SUPPORTED_CHAINS,
} from '@crypto-tracker/shared';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionsService } from '../transactions/transactions.service';
import { PriceService } from '../transactions/sync/price.service';
import { SyncService } from '../transactions/sync/sync.service';

const STALE_AFTER_MS = 10 * 60 * 1000;
const USD_STABLECOIN_SYMBOLS = new Set(['MUSD', 'AMUSD', 'USDC', 'USDT', 'USDC.E', 'USDT0', 'DAI']);
const ETH_LIKE_SYMBOLS = new Set(['ETH', 'WETH']);
const POLYGON_LIKE_SYMBOLS = new Set(['POL', 'MATIC', 'WMATIC']);

type PortfolioAccountRow = {
  id: string;
  address: string;
  lastRefreshRequestedAt: Date | null;
  lastSuccessfulSyncAt: Date | null;
  lastSyncState: string | null;
  lastSyncError: string | null;
};

type TokenTransferJson = {
  from?: unknown;
  to?: unknown;
  value?: unknown;
  tokenSymbol?: unknown;
  tokenName?: unknown;
  tokenDecimal?: unknown;
  contractAddress?: unknown;
};

type HoldingAccumulator = {
  chainId: number;
  assetAddress: string | null;
  symbol: string;
  name: string;
  balance: number;
  isNative: boolean;
};

function formatUnits(value: string, decimals: number): number {
  const normalized = value.replace(/^0+/, '') || '0';
  if (decimals === 0) {
    return Number(normalized);
  }

  const padded = normalized.padStart(decimals + 1, '0');
  const whole = padded.slice(0, -decimals) || '0';
  const fraction = padded.slice(-decimals).replace(/0+$/, '');
  return Number(fraction ? `${whole}.${fraction}` : whole);
}

function formatDecimal(value: number): string {
  if (!Number.isFinite(value)) {
    return '0';
  }

  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: Math.abs(value) >= 1 ? 6 : 8,
    useGrouping: false,
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function isTokenTransferJson(value: unknown): value is TokenTransferJson {
  return isRecord(value);
}

function getNativeSymbol(chainId: number): string {
  return SUPPORTED_CHAINS[chainId as keyof typeof SUPPORTED_CHAINS]?.symbol ?? 'ETH';
}

@Injectable()
export class PortfolioService {
  private portfolioAccountsTableAvailablePromise?: Promise<boolean>;
  private walletSyncColumnsAvailablePromise?: Promise<boolean>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly syncService: SyncService,
    private readonly transactionsService: TransactionsService,
    private readonly priceService: PriceService,
  ) {}

  async connect(userId: string, address: string): Promise<PortfolioOverview> {
    await this.setPrimaryAddress(userId, address.toLowerCase());
    return this.getOverview(userId);
  }

  async setPrimaryAddress(userId: string, address: string): Promise<void> {
    const normalized = address.toLowerCase();
    await this.upsertPortfolioAccount(userId, normalized);
    await this.ensureWalletsForAddress(userId, normalized);
  }

  async refresh(userId: string): Promise<PortfolioSyncStatus> {
    const address = await this.getPrimaryAddress(userId);
    if (!address) {
      throw new BadRequestException('Connect MetaMask to start your portfolio.');
    }

    const currentStatus = await this.getSyncStatus(userId);
    if (currentStatus.state === 'SYNCING') {
      return currentStatus;
    }
    if (!currentStatus.isStale && currentStatus.lastSyncedAt) {
      return currentStatus;
    }

    const wallets = await this.ensureWalletsForAddress(userId, address);
    await this.updatePortfolioAccountSyncMeta(userId, {
      lastRefreshRequestedAt: new Date(),
      lastSyncState: 'SYNCING',
      lastSyncError: null,
    });

    const failedChains: number[] = [];
    let syncedAny = false;

    for (const wallet of wallets) {
      try {
        await this.syncService.syncWallet(userId, wallet.id);
        syncedAny = true;
      } catch (error) {
        failedChains.push(wallet.chainId);
        const message = error instanceof Error ? error.message : 'Sync failed';
        await this.updatePortfolioAccountSyncMeta(userId, {
          lastSyncError: message,
        });
      }
    }

    const nextState: PortfolioSyncState =
      failedChains.length === 0 ? 'IDLE' : syncedAny ? 'PARTIAL' : 'ERROR';

    await this.updatePortfolioAccountSyncMeta(userId, {
      lastSyncState: nextState,
      lastSuccessfulSyncAt: syncedAny ? new Date() : undefined,
    });

    return this.getSyncStatus(userId);
  }

  async getOverview(userId: string): Promise<PortfolioOverview> {
    const address = await this.getPrimaryAddress(userId);
    const syncStatus = await this.getSyncStatus(userId);

    if (!address) {
      return {
        address: null,
        totalBalanceUsd: '0.00',
        totalTransactions: 0,
        totalInflowsUsd: '0.00',
        totalOutflowsUsd: '0.00',
        holdings: [],
        syncStatus,
      };
    }

    const [holdings, stats] = await Promise.all([
      this.buildHoldings(userId, address),
      this.transactionsService.stats(userId, { source: 'HOLDINGS' }),
    ]);

    const totalBalanceUsd = holdings.reduce((sum, holding) => sum + Number(holding.balanceUsd ?? 0), 0);

    return {
      address,
      totalBalanceUsd: totalBalanceUsd.toFixed(2),
      totalTransactions: stats.txCount,
      totalInflowsUsd: stats.totalReceived.toFixed(2),
      totalOutflowsUsd: stats.totalSpent.toFixed(2),
      holdings,
      syncStatus,
    };
  }

  async getSyncStatus(userId: string): Promise<PortfolioSyncStatus> {
    const account = await this.getPortfolioAccount(userId);
    const address = account?.address ?? (await this.getPrimaryAddress(userId));

    if (!address) {
      return {
        address: null,
        state: 'UNCONFIGURED',
        isStale: true,
        lastSyncedAt: null,
        lastRefreshRequestedAt: null,
        failedChains: [],
        message: 'Connect MetaMask to load your portfolio.',
      };
    }

    const hasWalletSyncColumns = await this.hasWalletSyncColumns();
    if (!hasWalletSyncColumns) {
      return {
        address,
        state: 'ERROR',
        isStale: true,
        lastSyncedAt: null,
        lastRefreshRequestedAt: account?.lastRefreshRequestedAt?.toISOString() ?? null,
        failedChains: [],
        message: 'Run the latest database migration to enable automatic portfolio sync.',
      };
    }

    const wallets = await this.prisma.wallet.findMany({
      where: { userId, address },
      orderBy: { chainId: 'asc' },
      select: {
        chainId: true,
        lastSyncedAt: true,
        syncStatus: true,
      },
    });

    const lastSyncedAt = wallets
      .map((wallet) => wallet.lastSyncedAt?.getTime() ?? 0)
      .reduce((latest, value) => (value > latest ? value : latest), account?.lastSuccessfulSyncAt?.getTime() ?? 0);

    const failedChains = wallets
      .filter((wallet) => wallet.syncStatus === SyncStatus.FAILED)
      .map((wallet) => wallet.chainId);
    const isSyncing = wallets.some((wallet) => wallet.syncStatus === SyncStatus.SYNCING);
    const hasAnySuccess = wallets.some((wallet) => wallet.lastSyncedAt);
    const isStale = !lastSyncedAt || Date.now() - lastSyncedAt > STALE_AFTER_MS;

    let state: PortfolioSyncState = 'IDLE';
    if (isSyncing) {
      state = 'SYNCING';
    } else if (failedChains.length > 0 && hasAnySuccess) {
      state = 'PARTIAL';
    } else if (failedChains.length > 0) {
      state = 'ERROR';
    }

    const message =
      state === 'SYNCING'
        ? 'Syncing your MetaMask activity in the background.'
        : state === 'PARTIAL'
          ? 'Some chains failed, showing the last successful data.'
          : state === 'ERROR'
            ? account?.lastSyncError ?? 'Sync failed. Showing the last known state.'
            : !hasAnySuccess
              ? 'Connect MetaMask and your history will load automatically.'
              : isStale
                ? 'Refreshing will happen automatically when you open portfolio pages.'
                : 'Portfolio is up to date.';

    return {
      address,
      state,
      isStale,
      lastSyncedAt: lastSyncedAt ? new Date(lastSyncedAt).toISOString() : null,
      lastRefreshRequestedAt: account?.lastRefreshRequestedAt?.toISOString() ?? null,
      failedChains,
      message,
    };
  }

  private async buildHoldings(userId: string, address: string): Promise<PortfolioHolding[]> {
    const holdings = new Map<string, HoldingAccumulator>();
    const priceCache = new Map<string, number | null>();
    const transactions = await this.prisma.transaction.findMany({
      where: {
        wallet: {
          userId,
          address,
        },
      },
      select: {
        chainId: true,
        fromAddress: true,
        toAddress: true,
        gasUsed: true,
        gasPriceGwei: true,
        rawData: true,
      },
      orderBy: { timestamp: 'asc' },
    });

    for (const transaction of transactions) {
      const chainId = transaction.chainId;
      const nativeSymbol = getNativeSymbol(chainId);
      const nativeKey = `${chainId}:native`;
      const nativeHolding = holdings.get(nativeKey) ?? {
        chainId,
        assetAddress: null,
        symbol: nativeSymbol,
        name: nativeSymbol,
        balance: 0,
        isNative: true,
      };

      const normalTx = isRecord(transaction.rawData) && isRecord(transaction.rawData['normalTx'])
        ? transaction.rawData['normalTx']
        : null;

      const normalValueRaw = typeof normalTx?.['value'] === 'string' ? normalTx['value'] : '0';
      const nativeValue = formatUnits(normalValueRaw, 18);
      if (transaction.toAddress?.toLowerCase() === address) {
        nativeHolding.balance += nativeValue;
      }
      if (transaction.fromAddress.toLowerCase() === address) {
        nativeHolding.balance -= nativeValue;
        const gasUsed = Number(transaction.gasUsed ?? 0n);
        const gasPriceGwei = Number(transaction.gasPriceGwei ?? 0);
        const gasCostNative = (gasUsed * gasPriceGwei) / 1_000_000_000;
        nativeHolding.balance -= gasCostNative;
      }
      holdings.set(nativeKey, nativeHolding);

      const tokenTransfers = isRecord(transaction.rawData) && Array.isArray(transaction.rawData['tokenTransfers'])
        ? transaction.rawData['tokenTransfers']
        : [];

      for (const transferCandidate of tokenTransfers) {
        if (!isTokenTransferJson(transferCandidate)) continue;
        const symbol = typeof transferCandidate.tokenSymbol === 'string'
          ? transferCandidate.tokenSymbol.toUpperCase()
          : 'TOKEN';
        const name = typeof transferCandidate.tokenName === 'string'
          ? transferCandidate.tokenName
          : symbol;
        const decimals = Number(transferCandidate.tokenDecimal ?? '18');
        const contractAddress = typeof transferCandidate.contractAddress === 'string'
          ? transferCandidate.contractAddress.toLowerCase()
          : null;
        const amount = formatUnits(typeof transferCandidate.value === 'string' ? transferCandidate.value : '0', decimals);
        const key = `${chainId}:${contractAddress ?? symbol}`;
        const holding = holdings.get(key) ?? {
          chainId,
          assetAddress: contractAddress,
          symbol,
          name,
          balance: 0,
          isNative: false,
        };
        if (typeof transferCandidate.to === 'string' && transferCandidate.to.toLowerCase() === address) {
          holding.balance += amount;
        }
        if (typeof transferCandidate.from === 'string' && transferCandidate.from.toLowerCase() === address) {
          holding.balance -= amount;
        }
        holdings.set(key, holding);
      }
    }

    const result: PortfolioHolding[] = [];
    for (const holding of holdings.values()) {
      if (Math.abs(holding.balance) < 0.0000001) continue;

      const priceKey = `${holding.chainId}:${holding.symbol}`;
      let priceUsd = priceCache.get(priceKey);
      if (priceUsd === undefined) {
        priceUsd = await this.resolveCurrentPriceUsd(holding.chainId, holding.symbol);
        priceCache.set(priceKey, priceUsd);
      }

      const balanceUsd = priceUsd === null ? null : (holding.balance * priceUsd).toFixed(2);
      result.push({
        chainId: holding.chainId,
        assetAddress: holding.assetAddress,
        symbol: holding.symbol,
        name: holding.name,
        balance: formatDecimal(holding.balance),
        balanceUsd,
        priceUsd: priceUsd === null ? null : priceUsd.toFixed(4),
        isNative: holding.isNative,
      });
    }

    return result.sort((left, right) => Number(right.balanceUsd ?? 0) - Number(left.balanceUsd ?? 0));
  }

  private async resolveCurrentPriceUsd(chainId: number, symbol: string): Promise<number | null> {
    const normalized = symbol.toUpperCase();

    if (USD_STABLECOIN_SYMBOLS.has(normalized)) {
      return 1;
    }

    if (ETH_LIKE_SYMBOLS.has(normalized)) {
      return this.priceService.getCurrentUsdPrice(chainId);
    }

    if (POLYGON_LIKE_SYMBOLS.has(normalized)) {
      return this.priceService.getCurrentUsdPrice(137);
    }

    if (normalized === getNativeSymbol(chainId).toUpperCase()) {
      return this.priceService.getCurrentUsdPrice(chainId);
    }

    return null;
  }

  private async ensureWalletsForAddress(userId: string, address: string) {
    const chainIds = Object.keys(SUPPORTED_CHAINS).map(Number);
    const wallets = await Promise.all(
      chainIds.map((chainId) =>
        this.prisma.wallet.upsert({
          where: {
            userId_address_chainId: {
              userId,
              address,
              chainId,
            },
          },
          create: {
            userId,
            address,
            chainId,
            isVerified: true,
          },
          update: {
            isVerified: true,
          },
          select: {
            id: true,
            chainId: true,
          },
        }),
      ),
    );

    return wallets.sort((left, right) => left.chainId - right.chainId);
  }

  private async getPrimaryAddress(userId: string): Promise<string | null> {
    const account = await this.getPortfolioAccount(userId);
    if (account?.address) {
      return account.address.toLowerCase();
    }

    const wallet = await this.prisma.wallet.findFirst({
      where: { userId },
      orderBy: [{ isVerified: 'desc' }, { createdAt: 'asc' }],
      select: { address: true },
    });
    return wallet?.address.toLowerCase() ?? null;
  }

  private async getPortfolioAccount(userId: string): Promise<PortfolioAccountRow | null> {
    if (!(await this.hasPortfolioAccountsTable())) {
      return null;
    }

    const rows = await this.prisma.$queryRaw<PortfolioAccountRow[]>(Prisma.sql`
      SELECT
        "id",
        "address",
        "lastRefreshRequestedAt",
        "lastSuccessfulSyncAt",
        "lastSyncState",
        "lastSyncError"
      FROM "portfolio_accounts"
      WHERE "userId" = ${userId}
      LIMIT 1
    `);

    return rows[0] ?? null;
  }

  private async upsertPortfolioAccount(userId: string, address: string): Promise<void> {
    if (!(await this.hasPortfolioAccountsTable())) {
      return;
    }

    const existing = await this.getPortfolioAccount(userId);
    const id = existing?.id ?? randomUUID();

    await this.prisma.$executeRaw(Prisma.sql`
      INSERT INTO "portfolio_accounts"
        ("id", "userId", "address", "lastSyncState", "createdAt", "updatedAt")
      VALUES
        (${id}, ${userId}, ${address}, 'IDLE', NOW(), NOW())
      ON CONFLICT ("userId")
      DO UPDATE SET
        "address" = EXCLUDED."address",
        "updatedAt" = NOW()
    `);
  }

  private async updatePortfolioAccountSyncMeta(
    userId: string,
    updates: {
      lastRefreshRequestedAt?: Date;
      lastSuccessfulSyncAt?: Date;
      lastSyncState?: string | null;
      lastSyncError?: string | null;
    },
  ): Promise<void> {
    if (!(await this.hasPortfolioAccountsTable())) {
      return;
    }

    const existing = await this.getPortfolioAccount(userId);
    const address = existing?.address ?? (await this.getPrimaryAddress(userId));
    if (!address) {
      return;
    }

    const id = existing?.id ?? randomUUID();

    await this.prisma.$executeRaw(Prisma.sql`
      INSERT INTO "portfolio_accounts"
        (
          "id",
          "userId",
          "address",
          "lastRefreshRequestedAt",
          "lastSuccessfulSyncAt",
          "lastSyncState",
          "lastSyncError",
          "createdAt",
          "updatedAt"
        )
      VALUES
        (
          ${id},
          ${userId},
          ${address},
          ${updates.lastRefreshRequestedAt ?? existing?.lastRefreshRequestedAt ?? null},
          ${updates.lastSuccessfulSyncAt ?? existing?.lastSuccessfulSyncAt ?? null},
          ${updates.lastSyncState ?? existing?.lastSyncState ?? 'IDLE'},
          ${updates.lastSyncError ?? existing?.lastSyncError ?? null},
          NOW(),
          NOW()
        )
      ON CONFLICT ("userId")
      DO UPDATE SET
        "address" = EXCLUDED."address",
        "lastRefreshRequestedAt" = EXCLUDED."lastRefreshRequestedAt",
        "lastSuccessfulSyncAt" = EXCLUDED."lastSuccessfulSyncAt",
        "lastSyncState" = EXCLUDED."lastSyncState",
        "lastSyncError" = EXCLUDED."lastSyncError",
        "updatedAt" = NOW()
    `);
  }

  private async hasPortfolioAccountsTable(): Promise<boolean> {
    if (!this.portfolioAccountsTableAvailablePromise) {
      this.portfolioAccountsTableAvailablePromise = this.prisma
        .$queryRaw<Array<{ exists: boolean }>>(Prisma.sql`
          SELECT EXISTS (
            SELECT 1
            FROM information_schema.tables
            WHERE table_schema = 'public'
              AND table_name = 'portfolio_accounts'
          ) AS "exists"
        `)
        .then((rows) => rows[0]?.exists ?? false)
        .catch(() => false);
    }

    return this.portfolioAccountsTableAvailablePromise;
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
}
