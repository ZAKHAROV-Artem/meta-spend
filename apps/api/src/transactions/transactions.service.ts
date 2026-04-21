import { Injectable, NotFoundException } from '@nestjs/common';
import { CardTxStatus, Prisma, TxType } from '@crypto-tracker/db';
import type {
  Transaction as TransactionResponse,
  TransactionStats,
  TxType as SharedTxType,
} from '@crypto-tracker/shared';
import { PrismaService } from '../prisma/prisma.service';
import { ListTransactionsDto } from './dto/list-transactions.dto';
import { StatsQueryDto } from './dto/stats-query.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

function parseFromDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    date.setUTCHours(0, 0, 0, 0);
  }
  return date;
}

function parseToDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    date.setUTCHours(23, 59, 59, 999);
  }
  return date;
}

const USD_STABLECOIN_SYMBOLS = new Set(['MUSD', 'AMUSD', 'USDC', 'USDT', 'USDC.E', 'USDT0', 'DAI']);
const ETH_LIKE_SYMBOLS = new Set(['ETH', 'WETH']);
const NATIVE_SYMBOL_BY_CHAIN: Record<number, string> = {
  1: 'ETH',
  10: 'ETH',
  137: 'POL',
  8453: 'ETH',
  42161: 'ETH',
  59144: 'ETH',
};

const KNOWN_CONTRACTS: Record<string, string> = {
  '0x7a250d5630b4cf539739df2c5dacb4c659f2488d': 'Uniswap',
  '0xe592427a0aece92de3edee1f18e0157c05861564': 'Uniswap',
  '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45': 'Uniswap',
  '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad': 'Uniswap',
  '0x99c9fc46f92e8a1c0dec1b1747d010903e884be1': 'Optimism Bridge',
  '0x3154cf16ccdb4c6d922629664174b904d80f2c35': 'Base Bridge',
  '0x4200000000000000000000000000000000000010': 'OP Stack Bridge',
  '0x0b3e328455c4059eeb9e3f84b5543f74e24e7e1b': 'Linea Bridge',
};

function formatAmountForTitle(value: string): string {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return value;
  if (numeric === 0) return '0';

  const abs = Math.abs(numeric);
  const fractionDigits = abs >= 1 ? 2 : abs >= 0.0001 ? 4 : 6;
  return numeric.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits,
  });
}

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

type TokenTransferJson = {
  from?: unknown;
  to?: unknown;
  value?: unknown;
  tokenSymbol?: unknown;
  tokenName?: unknown;
  tokenDecimal?: unknown;
  contractAddress?: unknown;
};

function isTokenTransferJson(value: unknown): value is TokenTransferJson {
  return isRecord(value);
}

type HoldingsRow = {
  id: string;
  walletId: string;
  hash: string;
  chainId: number;
  blockNumber: bigint | null;
  timestamp: Date;
  fromAddress: string;
  toAddress: string | null;
  value: Prisma.Decimal;
  valueUsd: Prisma.Decimal | null;
  gasUsed: bigint | null;
  gasPriceGwei: Prisma.Decimal | null;
  gasCostUsd: Prisma.Decimal | null;
  txType: TxType;
  categoryId: string | null;
  notes: string | null;
  rawData: Prisma.JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
  wallet: { address: string };
};

type CardRow = {
  id: string;
  occurredAt: Date;
  merchantName: string;
  fiatAmount: Prisma.Decimal;
  fiatCurrency: string;
  cryptoAmount: Prisma.Decimal | null;
  cryptoSymbol: string | null;
  status: CardTxStatus;
  categoryId: string | null;
  notes: string | null;
};

@Injectable()
export class TransactionsService {
  private portfolioAccountsTableAvailablePromise?: Promise<boolean>;

  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, dto: ListTransactionsDto) {
    const source = dto.source ?? 'HOLDINGS';

    if (source === 'CARD') {
      const where = this.buildCardWhere(userId, dto);
      const page = dto.page ?? 1;
      const limit = dto.limit ?? 50;
      const skip = (page - 1) * limit;

      const [items, total] = await Promise.all([
        this.prisma.cardTransaction.findMany({
          where,
          orderBy: { occurredAt: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.cardTransaction.count({ where }),
      ]);

      return {
        items: items.map((item) => this.toCardTransactionResponse(item)),
        total,
        page,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      };
    }

    const primaryAddress = await this.getPrimaryAddress(userId);
    const where = this.buildHoldingsWhere(userId, primaryAddress, dto);
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 50;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
        include: {
          wallet: { select: { address: true } },
        },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      items: items.map((item) => this.toHoldingsTransactionResponse(item)),
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async stats(userId: string, dto: Partial<StatsQueryDto>): Promise<TransactionStats> {
    const source = dto.source ?? 'ALL';

    if (source === 'CARD') {
      const [rows, categories] = await Promise.all([
        this.prisma.cardTransaction.findMany({
          where: this.buildCardWhere(userId, dto),
          orderBy: { occurredAt: 'asc' },
        }),
        this.getCategoriesMap(),
      ]);
      return this.buildStatsFromCardRows(rows, categories);
    }

    if (source === 'HOLDINGS') {
      const primaryAddress = await this.getPrimaryAddress(userId);
      const [rows, categories] = await Promise.all([
        this.prisma.transaction.findMany({
          where: this.buildHoldingsWhere(userId, primaryAddress, dto),
          orderBy: { timestamp: 'asc' },
          include: {
            wallet: { select: { address: true } },
          },
        }),
        this.getCategoriesMap(),
      ]);
      return this.buildStatsFromHoldingsRows(rows, categories);
    }

    const [holdings, cards] = await Promise.all([
      this.stats(userId, { ...dto, source: 'HOLDINGS' }),
      this.stats(userId, { ...dto, source: 'CARD' }),
    ]);

    const monthly = Array.from({ length: 12 }, (_, index) => ({
      month: index + 1,
      year: holdings.monthly[index]?.year ?? cards.monthly[index]?.year ?? new Date().getUTCFullYear(),
      spent: (holdings.monthly[index]?.spent ?? 0) + (cards.monthly[index]?.spent ?? 0),
      received: (holdings.monthly[index]?.received ?? 0) + (cards.monthly[index]?.received ?? 0),
    }));

    const breakdownMap = new Map<
      string | null,
      { categoryId: string | null; categoryName: string | null; categoryColor: string | null; total: number; count: number }
    >();

    for (const item of [...holdings.categoryBreakdown, ...cards.categoryBreakdown]) {
      const existing = breakdownMap.get(item.categoryId) ?? {
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        categoryColor: item.categoryColor,
        total: 0,
        count: 0,
      };
      existing.total += item.total;
      existing.count += item.count;
      if (!existing.categoryName) existing.categoryName = item.categoryName;
      if (!existing.categoryColor) existing.categoryColor = item.categoryColor;
      breakdownMap.set(item.categoryId, existing);
    }

    return {
      totalSpent: holdings.totalSpent + cards.totalSpent,
      totalReceived: holdings.totalReceived + cards.totalReceived,
      totalGasFees: holdings.totalGasFees + cards.totalGasFees,
      txCount: holdings.txCount + cards.txCount,
      monthly,
      categoryBreakdown: Array.from(breakdownMap.values()).sort((left, right) => right.total - left.total),
    };
  }

  async updateOne(userId: string, txId: string, dto: UpdateTransactionDto) {
    const existing = await this.prisma.transaction.findFirst({
      where: {
        id: txId,
        wallet: { userId },
      },
    });

    if (!existing) {
      throw new NotFoundException('Transaction not found');
    }

    const updated = await this.prisma.transaction.update({
      where: { id: txId },
      data: {
        categoryId: dto.categoryId === undefined ? existing.categoryId : dto.categoryId,
        notes: dto.notes === undefined ? existing.notes : dto.notes,
      },
      include: {
        wallet: { select: { address: true } },
      },
    });

    return this.toHoldingsTransactionResponse(updated);
  }

  private buildHoldingsWhere(
    userId: string,
    primaryAddress: string | null,
    dto: Pick<ListTransactionsDto, 'chainId' | 'txType' | 'categoryId' | 'from' | 'to' | 'search'>,
  ): Prisma.TransactionWhereInput {
    const from = parseFromDate(dto.from);
    const to = parseToDate(dto.to);

    const where: Prisma.TransactionWhereInput = {
      wallet: {
        userId,
        ...(primaryAddress ? { address: primaryAddress } : { id: '__missing__' }),
      },
    };

    if (dto.chainId) {
      where.chainId = dto.chainId;
    }
    if (dto.txType) {
      where.txType = dto.txType;
    }
    if (dto.categoryId) {
      where.categoryId = dto.categoryId;
    }
    if (from || to) {
      where.timestamp = {
        ...(from ? { gte: from } : {}),
        ...(to ? { lte: to } : {}),
      };
    }
    if (dto.search) {
      where.OR = [
        { hash: { contains: dto.search, mode: 'insensitive' } },
        { fromAddress: { contains: dto.search.toLowerCase(), mode: 'insensitive' } },
        { toAddress: { contains: dto.search.toLowerCase(), mode: 'insensitive' } },
        { notes: { contains: dto.search, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  private buildCardWhere(
    userId: string,
    dto: Pick<ListTransactionsDto, 'categoryId' | 'status' | 'from' | 'to' | 'search'>,
  ): Prisma.CardTransactionWhereInput {
    const from = parseFromDate(dto.from);
    const to = parseToDate(dto.to);
    const where: Prisma.CardTransactionWhereInput = { userId };

    if (dto.categoryId) {
      where.categoryId = dto.categoryId;
    }
    if (dto.status) {
      where.status = dto.status;
    }
    if (from || to) {
      where.occurredAt = {
        ...(from ? { gte: from } : {}),
        ...(to ? { lte: to } : {}),
      };
    }
    if (dto.search) {
      where.OR = [
        { merchantName: { contains: dto.search, mode: 'insensitive' } },
        { notes: { contains: dto.search, mode: 'insensitive' } },
        { externalId: { contains: dto.search, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  private buildStatsFromHoldingsRows(
    rows: HoldingsRow[],
    categoriesById: Map<string, { name: string; color: string }>,
  ): TransactionStats {
    const categories = new Map<string | null, { categoryId: string | null; total: number; count: number }>();
    const year = rows[0]?.timestamp.getUTCFullYear() ?? new Date().getUTCFullYear();
    const monthly = Array.from({ length: 12 }, (_, index) => ({
      month: index + 1,
      year,
      spent: 0,
      received: 0,
    }));

    let totalSpent = 0;
    let totalReceived = 0;
    let totalGasFees = 0;

    for (const row of rows) {
      const amount = this.getEffectiveValueUsd(row);
      totalGasFees += Number(row.gasCostUsd ?? 0);

      if (row.txType === TxType.TRANSFER_IN) {
        totalReceived += amount;
        monthly[row.timestamp.getUTCMonth()]!.received += amount;
      } else if (row.txType === TxType.TRANSFER_OUT || row.txType === TxType.BRIDGE) {
        totalSpent += amount;
        monthly[row.timestamp.getUTCMonth()]!.spent += amount;
      }

      const bucket = categories.get(row.categoryId) ?? {
        categoryId: row.categoryId,
        total: 0,
        count: 0,
      };
      bucket.total += amount;
      bucket.count += 1;
      categories.set(row.categoryId, bucket);
    }

    return {
      totalSpent,
      totalReceived,
      totalGasFees,
      txCount: rows.length,
      monthly,
      categoryBreakdown: Array.from(categories.values())
        .map((item) => ({
          categoryId: item.categoryId,
          categoryName: item.categoryId ? categoriesById.get(item.categoryId)?.name ?? null : null,
          categoryColor: item.categoryId ? categoriesById.get(item.categoryId)?.color ?? null : null,
          total: item.total,
          count: item.count,
        }))
        .sort((left, right) => right.total - left.total),
    };
  }

  private buildStatsFromCardRows(
    rows: CardRow[],
    categoriesById: Map<string, { name: string; color: string }>,
  ): TransactionStats {
    const categories = new Map<string | null, { categoryId: string | null; total: number; count: number }>();
    const year = rows[0]?.occurredAt.getUTCFullYear() ?? new Date().getUTCFullYear();
    const monthly = Array.from({ length: 12 }, (_, index) => ({
      month: index + 1,
      year,
      spent: 0,
      received: 0,
    }));

    let totalSpent = 0;
    let totalReceived = 0;

    for (const row of rows) {
      const amount = Number(row.fiatAmount);
      if (row.status === CardTxStatus.REFUNDED) {
        totalReceived += amount;
        monthly[row.occurredAt.getUTCMonth()]!.received += amount;
      } else if (row.status === CardTxStatus.SETTLED || row.status === CardTxStatus.PENDING) {
        totalSpent += amount;
        monthly[row.occurredAt.getUTCMonth()]!.spent += amount;
      }

      const bucket = categories.get(row.categoryId) ?? {
        categoryId: row.categoryId,
        total: 0,
        count: 0,
      };
      bucket.total += amount;
      bucket.count += 1;
      categories.set(row.categoryId, bucket);
    }

    return {
      totalSpent,
      totalReceived,
      totalGasFees: 0,
      txCount: rows.length,
      monthly,
      categoryBreakdown: Array.from(categories.values())
        .map((item) => ({
          categoryId: item.categoryId,
          categoryName: item.categoryId ? categoriesById.get(item.categoryId)?.name ?? null : null,
          categoryColor: item.categoryId ? categoriesById.get(item.categoryId)?.color ?? null : null,
          total: item.total,
          count: item.count,
        }))
        .sort((left, right) => right.total - left.total),
    };
  }

  private toHoldingsTransactionResponse(transaction: HoldingsRow): TransactionResponse {
    const tokenMeta = this.extractPrimaryTokenTransfer(transaction.rawData, transaction.fromAddress, transaction.toAddress);
    const value = tokenMeta?.value ?? transaction.value.toString();
    const valueUsd =
      tokenMeta && (transaction.valueUsd === null || transaction.valueUsd.equals(0))
        ? this.deriveTokenUsdValue(tokenMeta.value, tokenMeta.symbol)
        : transaction.valueUsd?.toString() ?? null;

    const walletAddress = transaction.wallet.address.toLowerCase();
    const counterpartyLabel = this.resolveCounterpartyLabel(
      transaction.fromAddress,
      transaction.toAddress,
      walletAddress,
    );
    const title = this.buildTitle({
      txType: transaction.txType,
      value,
      assetSymbol: tokenMeta?.symbol ?? null,
      chainId: transaction.chainId,
      nativeValue: transaction.value.toString(),
      rawData: transaction.rawData,
      walletAddress,
      counterpartyLabel,
    });

    return {
      id: transaction.id,
      source: 'HOLDINGS',
      occurredAt: transaction.timestamp.toISOString(),
      title,
      subtitle: counterpartyLabel ?? truncateHash(transaction.hash),
      amountUsd: valueUsd,
      direction: this.mapDirection(transaction.txType),
      categoryId: transaction.categoryId,
      notes: transaction.notes,
      chainId: transaction.chainId,
      hash: transaction.hash,
      txType: transaction.txType as SharedTxType,
      assetSymbol: tokenMeta?.symbol ?? null,
      counterpartyLabel,
      merchantName: null,
      status: null,
      fiatAmount: null,
      fiatCurrency: null,
      cryptoAmount: null,
      cryptoSymbol: null,
    };
  }

  private toCardTransactionResponse(transaction: CardRow): TransactionResponse {
    const amountUsd = transaction.fiatCurrency.toUpperCase() === 'USD' ? transaction.fiatAmount.toString() : null;

    return {
      id: transaction.id,
      source: 'CARD',
      occurredAt: transaction.occurredAt.toISOString(),
      title: transaction.merchantName,
      subtitle: transaction.status,
      amountUsd,
      direction: transaction.status === CardTxStatus.REFUNDED ? 'INFLOW' : transaction.status === CardTxStatus.DECLINED ? 'NEUTRAL' : 'OUTFLOW',
      categoryId: transaction.categoryId,
      notes: transaction.notes,
      chainId: null,
      hash: null,
      txType: null,
      assetSymbol: null,
      counterpartyLabel: null,
      merchantName: transaction.merchantName,
      status: transaction.status,
      fiatAmount: transaction.fiatAmount.toString(),
      fiatCurrency: transaction.fiatCurrency,
      cryptoAmount: transaction.cryptoAmount?.toString() ?? null,
      cryptoSymbol: transaction.cryptoSymbol ?? null,
    };
  }

  private mapDirection(txType: TxType): 'INFLOW' | 'OUTFLOW' | 'NEUTRAL' {
    if (txType === TxType.TRANSFER_IN) return 'INFLOW';
    if (txType === TxType.TRANSFER_SELF || txType === TxType.SWAP || txType === TxType.UNKNOWN) return 'NEUTRAL';
    return 'OUTFLOW';
  }

  private getEffectiveValueUsd(transaction: HoldingsRow): number {
    const derived =
      this.extractPrimaryTokenTransfer(transaction.rawData, transaction.fromAddress, transaction.toAddress) ?? null;
    if (transaction.valueUsd) {
      return Number(transaction.valueUsd);
    }
    if (!derived) {
      return 0;
    }
    const stableValue = this.deriveTokenUsdValue(derived.value, derived.symbol);
    return stableValue ? Number(stableValue) : 0;
  }

  private deriveTokenUsdValue(value: string, symbol: string | null): string | null {
    if (!symbol) return null;
    const normalized = symbol.toUpperCase();
    if (USD_STABLECOIN_SYMBOLS.has(normalized)) {
      return Number(value).toFixed(2);
    }
    if (ETH_LIKE_SYMBOLS.has(normalized)) {
      return null;
    }
    return null;
  }

  private extractPrimaryTokenTransfer(
    rawData: Prisma.JsonValue | null,
    fromAddress: string,
    toAddress: string | null,
  ): { value: string; symbol: string | null; name: string | null; address: string | null; decimals: number | null } | null {
    if (!isRecord(rawData)) {
      return null;
    }

    const transfersValue = rawData['tokenTransfers'];
    if (!Array.isArray(transfersValue) || transfersValue.length === 0) {
      return null;
    }

    const transfers: TokenTransferJson[] = [];
    for (const transfer of transfersValue) {
      if (isTokenTransferJson(transfer)) transfers.push(transfer);
    }
    if (transfers.length === 0) return null;

    const walletAddress = this.inferWalletAddress(fromAddress, toAddress, TxType.TRANSFER_OUT)?.toLowerCase();
    const picked =
      transfers.find((transfer) => typeof transfer.from === 'string' && transfer.from.toLowerCase() === walletAddress) ??
      transfers.find((transfer) => typeof transfer.to === 'string' && transfer.to.toLowerCase() === walletAddress) ??
      transfers[0];
    if (!picked) return null;

    const decimals = Number(picked.tokenDecimal ?? '18');

    return {
      value: formatUnits(typeof picked.value === 'string' ? picked.value : '0', decimals),
      symbol: typeof picked.tokenSymbol === 'string' ? picked.tokenSymbol.toUpperCase() : null,
      name: typeof picked.tokenName === 'string' ? picked.tokenName : null,
      address: typeof picked.contractAddress === 'string' ? picked.contractAddress.toLowerCase() : null,
      decimals: Number.isFinite(decimals) ? decimals : null,
    };
  }

  private inferWalletAddress(
    fromAddress: string,
    toAddress: string | null,
    txType: TxType,
  ): string | null {
    if (txType === TxType.TRANSFER_IN && toAddress) {
      return toAddress.toLowerCase();
    }
    return fromAddress?.toLowerCase() || toAddress?.toLowerCase() || null;
  }

  private resolveCounterpartyLabel(
    fromAddress: string,
    toAddress: string | null,
    walletAddress: string | null,
  ): string | null {
    const candidates = [toAddress?.toLowerCase(), fromAddress.toLowerCase()];
    for (const candidate of candidates) {
      if (!candidate || candidate === walletAddress) continue;
      const label = KNOWN_CONTRACTS[candidate];
      if (label) return label;
    }
    return null;
  }

  private buildTitle(input: {
    txType: TxType;
    value: string;
    assetSymbol: string | null;
    chainId: number;
    nativeValue: string;
    rawData: Prisma.JsonValue | null;
    walletAddress: string | null;
    counterpartyLabel: string | null;
  }): string {
    const { txType, value, assetSymbol, counterpartyLabel } = input;
    const amount = formatAmountForTitle(value);
    const nativeSymbol = NATIVE_SYMBOL_BY_CHAIN[input.chainId] ?? 'ETH';
    const displaySymbol = assetSymbol?.trim() || nativeSymbol;
    const nativeAmount = formatAmountForTitle(input.nativeValue);

    switch (txType) {
      case TxType.TRANSFER_OUT:
        return counterpartyLabel ? `${counterpartyLabel} · ${amount} ${displaySymbol}` : `Sent ${amount} ${displaySymbol}`;
      case TxType.TRANSFER_IN:
        return counterpartyLabel ? `${counterpartyLabel} · Received ${amount} ${displaySymbol}` : `Received ${amount} ${displaySymbol}`;
      case TxType.TRANSFER_SELF:
        return `Self-transfer · ${amount} ${displaySymbol}`;
      case TxType.SWAP: {
        const pair = this.resolveSwapPair(input.rawData, input.walletAddress);
        if (pair) {
          return `Swap · ${pair.from} → ${pair.to}`;
        }
        return counterpartyLabel ? `Swap · ${counterpartyLabel}` : 'Swap';
      }
      case TxType.BRIDGE:
        return `Bridge · ${assetSymbol ? amount : nativeAmount} ${displaySymbol}`;
      case TxType.CONTRACT_INTERACTION:
        return counterpartyLabel ? `Contract · ${counterpartyLabel}` : 'Contract call';
      case TxType.GAS_ONLY:
        return 'Gas fee';
      case TxType.UNKNOWN:
      default:
        return counterpartyLabel ?? 'Transaction';
    }
  }

  private resolveSwapPair(
    rawData: Prisma.JsonValue | null,
    walletAddress: string | null,
  ): { from: string; to: string } | null {
    if (!isRecord(rawData) || !walletAddress) {
      return null;
    }

    const transfersValue = rawData['tokenTransfers'];
    if (!Array.isArray(transfersValue) || transfersValue.length === 0) {
      return null;
    }

    let outgoing: TokenTransferJson | null = null;
    let incoming: TokenTransferJson | null = null;

    for (const transfer of transfersValue) {
      if (!isTokenTransferJson(transfer)) continue;
      if (!outgoing && typeof transfer.from === 'string' && transfer.from.toLowerCase() === walletAddress) {
        outgoing = transfer;
      }
      if (!incoming && typeof transfer.to === 'string' && transfer.to.toLowerCase() === walletAddress) {
        incoming = transfer;
      }
    }

    if (!outgoing || !incoming) {
      return null;
    }

    return {
      from: `${formatAmountForTitle(formatUnits(String(outgoing.value ?? '0'), Number(outgoing.tokenDecimal ?? '18')))} ${String(outgoing.tokenSymbol ?? 'TOKEN').toUpperCase()}`,
      to: `${formatAmountForTitle(formatUnits(String(incoming.value ?? '0'), Number(incoming.tokenDecimal ?? '18')))} ${String(incoming.tokenSymbol ?? 'TOKEN').toUpperCase()}`,
    };
  }

  private async getPrimaryAddress(userId: string): Promise<string | null> {
    const portfolioAccount = await this.getPortfolioAccountAddress(userId);
    if (portfolioAccount) {
      return portfolioAccount;
    }

    const wallet = await this.prisma.wallet.findFirst({
      where: { userId },
      orderBy: [{ isVerified: 'desc' }, { createdAt: 'asc' }],
      select: { address: true },
    });
    return wallet?.address.toLowerCase() ?? null;
  }

  private async getPortfolioAccountAddress(userId: string): Promise<string | null> {
    if (!(await this.hasPortfolioAccountsTable())) {
      return null;
    }

    const rows = await this.prisma.$queryRaw<Array<{ address: string }>>(Prisma.sql`
      SELECT "address"
      FROM "portfolio_accounts"
      WHERE "userId" = ${userId}
      LIMIT 1
    `);

    return rows[0]?.address?.toLowerCase() ?? null;
  }

  private async getCategoriesMap(): Promise<Map<string, { name: string; color: string }>> {
    const categories = await this.prisma.category.findMany({
      select: { id: true, name: true, color: true },
    });

    return new Map(categories.map((category) => [category.id, { name: category.name, color: category.color }]));
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
}

function truncateHash(hash: string): string {
  return `${hash.slice(0, 10)}...${hash.slice(-6)}`;
}
