import { Injectable, NotFoundException } from '@nestjs/common';
import { CardTxStatus, Prisma, TransactionSource } from '@crypto-tracker/db';
import type {
  BulkCategorizeResult,
  CardTransactionAnalytics,
  CategoryBreakdown,
  MonthlyStats,
  PaginatedTransactions,
  Transaction as TransactionResponse,
  UniqueMerchant,
} from '@crypto-tracker/shared';
import { normalizeMerchantKey } from '@crypto-tracker/shared';
import { PrismaService } from '../prisma/prisma.service';
import { ExchangeRateService } from '../common/exchange-rate/exchange-rate.service';
import { ListTransactionsDto } from './dto/list-transactions.dto';
import { StatsQueryDto } from './dto/stats-query.dto';
import { BulkCategorizeDto } from './dto/bulk-categorize.dto';
import { UpdateCardMerchantCategoryDto } from './dto/update-card-merchant-category.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { UniqueMerchantsQueryDto } from './dto/unique-merchants-query.dto';
import {
  avgTransactionAmountTrend,
  cardExchangeRate,
  cardGasFee,
  cryptoSpendSummaries,
  exchangeRateTrend,
} from './card-transaction-metrics';

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

function parseCsvIds(value?: string): string[] {
  return value
    ? value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
}

const SPENDING_STATUSES: CardTxStatus[] = [CardTxStatus.SETTLED, CardTxStatus.PENDING];

type CardRow = Prisma.TransactionGetPayload<{
  include: {
    category: { select: { name: true, color: true } };
    subcategory: { select: { name: true, color: true } };
  };
}>;

function transactionDirection(row: { status?: CardTxStatus | null; fiatAmount?: Prisma.Decimal | string | number | null }): 'INFLOW' | 'OUTFLOW' | 'NEUTRAL' {
  const status = row.status ?? CardTxStatus.SETTLED;
  if (status === CardTxStatus.DECLINED) return 'NEUTRAL';
  if (status === CardTxStatus.REFUNDED || Number(row.fiatAmount ?? 0) > 0) return 'INFLOW';
  return 'OUTFLOW';
}

function isCardSpend(row: { status?: CardTxStatus | null; fiatAmount?: Prisma.Decimal | string | number | null }): boolean {
  const status = row.status ?? CardTxStatus.SETTLED;
  return SPENDING_STATUSES.includes(status) && transactionDirection(row) === 'OUTFLOW';
}

function isCardReceived(row: { status?: CardTxStatus | null; fiatAmount?: Prisma.Decimal | string | number | null }): boolean {
  return transactionDirection(row) === 'INFLOW';
}

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fxService: ExchangeRateService,
  ) {}

  async list(userId: string, dto: ListTransactionsDto): Promise<PaginatedTransactions> {
    const where = this.buildCardWhere(userId, dto);
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
          category: { select: { name: true, color: true } },
          subcategory: { select: { name: true, color: true } },
        },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      items: items.map((item) => this.toCardTransactionResponse(item)),
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async stats(userId: string, dto: Partial<StatsQueryDto>): Promise<CardTransactionAnalytics> {
    const where = this.buildCardWhere(userId, dto);
    const year = dto.from ? new Date(dto.from).getUTCFullYear() : dto.year ?? new Date().getUTCFullYear();

    const monthlyBase: Prisma.TransactionWhereInput = {
      ...where,
      timestamp: {
        gte: parseFromDate(dto.from) ?? new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0)),
        lte: parseToDate(dto.to) ?? new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999)),
      },
    };

    const [rows, monthlyRows, categories] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        orderBy: { timestamp: 'asc' },
      }),
      this.prisma.transaction.findMany({
        where: monthlyBase,
        orderBy: { timestamp: 'asc' },
      }),
      this.prisma.category.findMany({
        select: { id: true, name: true, color: true },
      }),
    ]);

    const fxRates = dto.defaultCurrency
      ? await this.fxService.getRates(dto.defaultCurrency)
      : null;

    const categoriesById = new Map(categories.map((c) => [c.id, c]));
    return this.buildCardAnalytics(rows, monthlyRows, categoriesById, year, fxRates, dto.defaultCurrency ?? null);
  }

  async updateOne(userId: string, txId: string, dto: UpdateTransactionDto) {
    const existing = await this.prisma.transaction.findFirst({
      where: {
        id: txId,
        userId,
        source: TransactionSource.CARD,
      },
      include: {
        category: { select: { name: true, color: true } },
        subcategory: { select: { name: true, color: true } },
      },
    });

    if (!existing) {
      throw new NotFoundException('Transaction not found');
    }

    const nextCategoryId = dto.categoryId === undefined ? existing.categoryId : dto.categoryId;

    const updated = await this.prisma.transaction.update({
      where: { id: txId },
      data: {
        categoryId: nextCategoryId,
        notes: dto.notes === undefined ? existing.notes : dto.notes,
      },
      include: {
        category: { select: { name: true, color: true } },
        subcategory: { select: { name: true, color: true } },
      },
    });

    if (nextCategoryId && updated.merchantName) {
      await this.persistMerchantMemoryFromTx(userId, updated.merchantName, nextCategoryId, 'manual');
    }

    return this.toCardTransactionResponse(updated);
  }

  async cardMerchants(userId: string): Promise<UniqueMerchant[]> {
    const [txRows, categories] = await Promise.all([
      this.prisma.transaction.findMany({
        where: {
          userId,
          source: TransactionSource.CARD,
        },
        orderBy: { timestamp: 'desc' },
        select: {
          merchantName: true,
          fiatAmount: true,
          fiatCurrency: true,
          categoryId: true,
          timestamp: true,
          status: true,
        },
      }),
      this.prisma.category.findMany({
        where: { userId },
        select: { id: true, name: true, color: true },
      }),
    ]);

    const categoriesById = new Map(categories.map((category) => [category.id, category]));
    const grouped = new Map<
      string,
      {
        key: string;
        displayName: string;
        count: number;
        totalFiatSpend: number;
        currency: string | null;
        lastSeenAt: Date;
        categoryCounts: Map<string | null, number>;
      }
    >();

    const countableStatuses = new Set<CardTxStatus>([
      CardTxStatus.SETTLED,
      CardTxStatus.PENDING,
      CardTxStatus.REFUNDED,
    ]);

    for (const row of txRows) {
      if (row.status && !countableStatuses.has(row.status)) {
        continue;
      }
      const key = normalizeMerchantKey(row.merchantName);
      if (!key) continue;

      const existing = grouped.get(key) ?? {
        key,
        displayName: row.merchantName ?? 'Card transaction',
        count: 0,
        totalFiatSpend: 0,
        currency: row.fiatCurrency ?? null,
        lastSeenAt: row.timestamp,
        categoryCounts: new Map<string | null, number>(),
      };

      existing.count += 1;
      existing.totalFiatSpend += Math.abs(Number(row.fiatAmount ?? 0));
      existing.currency = existing.currency ?? row.fiatCurrency ?? null;
      if (row.timestamp > existing.lastSeenAt) {
        existing.lastSeenAt = row.timestamp;
        existing.displayName = row.merchantName ?? existing.displayName;
      }
      existing.categoryCounts.set(row.categoryId, (existing.categoryCounts.get(row.categoryId) ?? 0) + 1);
      grouped.set(key, existing);
    }

    return Array.from(grouped.values())
      .map((item) => {
        const sortedCategories = Array.from(item.categoryCounts.entries()).sort((left, right) => right[1] - left[1]);
        const categoryId = sortedCategories[0]?.[0] ?? null;
        const category = categoryId ? categoriesById.get(categoryId) : null;

        return {
          key: item.key,
          displayName: item.displayName,
          source: 'CARD' as const,
          count: item.count,
          totalFiatSpend: Number(item.totalFiatSpend.toFixed(2)),
          currency: item.currency,
          lastSeenAt: item.lastSeenAt.toISOString(),
          categoryId,
          categoryName: category?.name ?? null,
          categoryColor: category?.color ?? null,
        };
      })
      .sort((left, right) => right.totalFiatSpend - left.totalFiatSpend);
  }

  async uniqueMerchants(userId: string, dto: UniqueMerchantsQueryDto): Promise<UniqueMerchant[]> {
    if (dto.source && dto.source !== 'CARD' && dto.source !== 'ALL') {
      return [];
    }

    return (await this.cardMerchants(userId)).sort((left, right) => {
      const categorySort = Number(Boolean(left.categoryId)) - Number(Boolean(right.categoryId));
      if (categorySort !== 0) return categorySort;
      if (right.count !== left.count) return right.count - left.count;
      return left.displayName.localeCompare(right.displayName);
    });
  }

  async bulkCategorize(userId: string, dto: BulkCategorizeDto): Promise<{ updated: number }> {
    const result = await this.updateCardMerchantCategory(userId, dto.key, {
      categoryId: dto.categoryId ?? null,
    });
    return { updated: result.updatedCount };
  }

  async updateCardMerchantCategory(
    userId: string,
    key: string,
    dto: UpdateCardMerchantCategoryDto,
  ): Promise<BulkCategorizeResult> {
    const categoryId = dto.categoryId ?? null;

    if (categoryId) {
      const category = await this.prisma.category.findFirst({
        where: { id: categoryId, userId },
        select: { id: true },
      });
      if (!category) throw new NotFoundException('Category not found');
    }

    const rows = await this.prisma.transaction.findMany({
      where: {
        userId,
        source: TransactionSource.CARD,
      },
      select: { id: true, merchantName: true },
    });
    const matchingIds = rows
      .filter((row) => normalizeMerchantKey(row.merchantName) === key)
      .map((row) => row.id);

    if (matchingIds.length === 0) {
      throw new NotFoundException('Merchant group not found');
    }

    const updated = await this.prisma.transaction.updateMany({
      where: { userId, source: TransactionSource.CARD, id: { in: matchingIds } },
      data: { categoryId, subcategoryId: null },
    });

    if (categoryId) {
      await this.prisma.cardMerchantMemory.upsert({
        where: { userId_merchantKey: { userId, merchantKey: key } },
        create: { userId, merchantKey: key, categoryId, learnedSource: 'manual' },
        update: { categoryId, learnedSource: 'manual' },
      });
    } else {
      await this.prisma.cardMerchantMemory.deleteMany({ where: { userId, merchantKey: key } });
    }

    return {
      key,
      categoryId,
      updatedCount: updated.count,
    };
  }

  private async persistMerchantMemoryFromTx(
    userId: string,
    merchantName: string,
    categoryId: string,
    learnedSource: 'manual' | 'ai',
  ): Promise<void> {
    const merchantKey = normalizeMerchantKey(merchantName);
    if (!merchantKey) return;
    await this.prisma.cardMerchantMemory.upsert({
      where: { userId_merchantKey: { userId, merchantKey } },
      create: { userId, merchantKey, categoryId, learnedSource },
      update: { categoryId, learnedSource },
    });
  }

  private buildCardWhere(
    userId: string,
    dto: Pick<ListTransactionsDto, 'categoryId' | 'subcategoryId' | 'status' | 'from' | 'to' | 'search'>,
  ): Prisma.TransactionWhereInput {
    const from = parseFromDate(dto.from);
    const to = parseToDate(dto.to);
    const where: Prisma.TransactionWhereInput = { userId, source: TransactionSource.CARD };
    const andFilters: Prisma.TransactionWhereInput[] = [];

    const categoryIds = parseCsvIds(dto.categoryId);
    const subcategoryIds = parseCsvIds(dto.subcategoryId);
    if (categoryIds.length > 0 && subcategoryIds.length > 0) {
      andFilters.push({
        OR: [
          { categoryId: categoryIds.length === 1 ? categoryIds[0] : { in: categoryIds } },
          { subcategoryId: subcategoryIds.length === 1 ? subcategoryIds[0] : { in: subcategoryIds } },
        ],
      });
    } else if (categoryIds.length === 1) {
      where.categoryId = categoryIds[0];
    } else if (categoryIds.length > 1) {
      where.categoryId = { in: categoryIds };
    } else if (subcategoryIds.length === 1) {
      where.subcategoryId = subcategoryIds[0];
    } else if (subcategoryIds.length > 1) {
      where.subcategoryId = { in: subcategoryIds };
    }
    if (dto.status) {
      where.status = dto.status;
    }
    if (from || to) {
      where.timestamp = {
        ...(from ? { gte: from } : {}),
        ...(to ? { lte: to } : {}),
      };
    }
    if (dto.search) {
      andFilters.push({
        OR: [
          { merchantName: { contains: dto.search, mode: 'insensitive' } },
          { notes: { contains: dto.search, mode: 'insensitive' } },
          { externalId: { contains: dto.search, mode: 'insensitive' } },
        ],
      });
    }
    if (andFilters.length > 0) {
      where.AND = andFilters;
    }

    return where;
  }

  /**
   * Native-currency-aware analytics for card spend. KPIs (`totalSpent`, `monthly`, main `categoryBreakdown`)
   * use rows in `displayCurrency` only when unambiguous (single dominant currency).
   */
  private buildCardAnalytics(
    rows: Prisma.TransactionGetPayload<object>[],
    monthlyRowsAll: Prisma.TransactionGetPayload<object>[],
    categoriesById: Map<string, { name: string; color: string }>,
    year: number,
    fxRates: Record<string, number> | null = null,
    defaultCurrency: string | null = null,
  ): CardTransactionAnalytics {
    const convert = (amount: number, nativeCurrency: string): number => {
      if (!fxRates || !nativeCurrency) return amount;
      const rate = fxRates[nativeCurrency.toUpperCase()];
      return rate ? amount / rate : amount;
    };

    const spendingRows = rows.filter(isCardSpend);
    const fiatAmongSpend = spendingRows.map((r) => (r.fiatCurrency ?? '').toUpperCase()).filter(Boolean);
    const uniqueFiat = [...new Set(fiatAmongSpend)];
    const displayCurrency = defaultCurrency ?? (uniqueFiat.length === 1 ? uniqueFiat[0]! : null);

    const mixedCurrencyNotice = !defaultCurrency && uniqueFiat.length > 1;

    const filterPrimary = displayCurrency ? (r: (typeof rows)[0]) => (r.fiatCurrency ?? '').toUpperCase() === displayCurrency : () => true;

    const primaryRows = fxRates ? rows : displayCurrency ? rows.filter(filterPrimary) : rows;

    const monthly = Array.from({ length: 12 }, (_, index) => ({
      month: index + 1,
      year,
      spent: 0,
      received: 0,
    }));

    let totalSpent = 0;
    let totalReceived = 0;
    const catMap = new Map<string | null, { categoryId: string | null; total: number; count: number }>();

    for (const row of primaryRows) {
      const amount = convert(Math.abs(Number(row.fiatAmount ?? 0)), row.fiatCurrency ?? '');
      if (isCardReceived(row)) {
        totalReceived += amount;
      } else if (isCardSpend(row)) {
        totalSpent += amount;
        const bucket = catMap.get(row.categoryId) ?? {
          categoryId: row.categoryId,
          total: 0,
          count: 0,
        };
        bucket.total += amount;
        bucket.count += 1;
        catMap.set(row.categoryId, bucket);
      }
    }

    for (const row of monthlyRowsAll) {
      if (!defaultCurrency && displayCurrency && (row.fiatCurrency ?? '').toUpperCase() !== displayCurrency) continue;
      const txYear = row.timestamp.getUTCFullYear();
      if (txYear !== year) continue;
      const monthIndex = row.timestamp.getUTCMonth();
      const amount = convert(Math.abs(Number(row.fiatAmount ?? 0)), row.fiatCurrency ?? '');
      if (isCardReceived(row)) {
        monthly[monthIndex]!.received += amount;
      } else if (isCardSpend(row)) {
        monthly[monthIndex]!.spent += amount;
      }
    }

    const categoryBreakdown: CategoryBreakdown[] = Array.from(catMap.values())
      .map((item) => ({
        categoryId: item.categoryId,
        categoryName: item.categoryId ? categoriesById.get(item.categoryId)?.name ?? null : null,
        categoryColor: item.categoryId ? categoriesById.get(item.categoryId)?.color ?? null : null,
        total: Number(item.total.toFixed(2)),
        count: item.count,
      }))
      .sort((a, b) => b.total - a.total);

    const denomSpent =
      categoryBreakdown.reduce((s, x) => s + x.total, 0) ||
      Number(totalSpent.toFixed(2)) ||
      (totalReceived > 0 ? totalReceived : 1);
    const categoryShares = categoryBreakdown.map((item) => ({
      ...item,
      sharePercent: Number(((item.total / denomSpent) * 100).toFixed(1)),
    }));

    /** Per-currency rollup for mixed-wallet analytics */
    const byCurrencyCodes = [...new Set(rows.map((r) => (r.fiatCurrency ?? '').toUpperCase()).filter(Boolean))];
    const byCurrency = byCurrencyCodes.map((currency) =>
      this.summarizeCurrencySlice(
        rows.filter((r) => (r.fiatCurrency ?? '').toUpperCase() === currency),
        categoriesById,
        year,
      ),
    );

    const merchantTotals = new Map<
      string,
      { displayName: string; total: number; count: number; currency: string | null }
    >();
    for (const row of primaryRows) {
      if (!isCardSpend(row)) continue;
      const key = normalizeMerchantKey(row.merchantName);
      if (!key) continue;
      const name = row.merchantName ?? 'Card transaction';
      const amount = Math.abs(Number(row.fiatAmount ?? 0));
      const cur = merchantTotals.get(key) ?? { displayName: name, total: 0, count: 0, currency: row.fiatCurrency };
      cur.total += amount;
      cur.count += 1;
      cur.currency = row.fiatCurrency ?? cur.currency;
      merchantTotals.set(key, cur);
    }
    const topMerchants = [...merchantTotals.entries()]
      .map(([key, v]) => ({
        key,
        displayName: v.displayName,
        total: Number(v.total.toFixed(2)),
        count: v.count,
        currency: v.currency,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 12);

    return {
      displayCurrency,
      mixedCurrencyNotice,
      totalSpent: Number(totalSpent.toFixed(2)),
      totalReceived: Number(totalReceived.toFixed(2)),
      netSpendPrimary: Number((totalSpent - totalReceived).toFixed(2)),
      totalGasFees: 0,
      txCount: rows.filter((r) => r.source === TransactionSource.CARD).length,
      declinedCount: rows.filter((r) => r.status === CardTxStatus.DECLINED).length,
      refundCount: rows.filter((r) => r.status === CardTxStatus.REFUNDED).length,
      monthly,
      categoryBreakdown,
      categoryShares,
      byCurrency,
      cryptoSpendSummaries: cryptoSpendSummaries(primaryRows),
      exchangeRateTrend: exchangeRateTrend(primaryRows),
      avgTransactionAmountTrend: avgTransactionAmountTrend(primaryRows),
      topMerchants,
    };
  }

  private summarizeCurrencySlice(
    slice: Prisma.TransactionGetPayload<object>[],
    categoriesById: Map<string, { name: string; color: string }>,
    year: number,
  ) {
    const monthly = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      year,
      spent: 0,
      received: 0,
    }));

    let totalSpent = 0;
    let totalReceived = 0;
    const catMap = new Map<string | null, { categoryId: string | null; total: number; count: number }>();

    for (const row of slice) {
      const amount = Math.abs(Number(row.fiatAmount ?? 0));
      if (isCardReceived(row)) totalReceived += amount;
      else if (isCardSpend(row)) {
        totalSpent += amount;
        const b = catMap.get(row.categoryId) ?? { categoryId: row.categoryId, total: 0, count: 0 };
        b.total += amount;
        b.count += 1;
        catMap.set(row.categoryId, b);
      }
    }

    for (const row of slice) {
      if (row.timestamp.getUTCFullYear() !== year) continue;
      const mi = row.timestamp.getUTCMonth();
      const amount = Math.abs(Number(row.fiatAmount ?? 0));
      if (isCardReceived(row)) monthly[mi]!.received += amount;
      else if (isCardSpend(row))
        monthly[mi]!.spent += amount;
    }

    const categoryBreakdown: CategoryBreakdown[] = [...catMap.values()]
      .map((item) => ({
        categoryId: item.categoryId,
        categoryName: item.categoryId ? categoriesById.get(item.categoryId)?.name ?? null : null,
        categoryColor: item.categoryId ? categoriesById.get(item.categoryId)?.color ?? null : null,
        total: Number(item.total.toFixed(2)),
        count: item.count,
      }))
      .sort((a, b) => b.total - a.total);

    const currency = slice[0]?.fiatCurrency?.toUpperCase() ?? '—';

    return {
      currency,
      totalSpent: Number(totalSpent.toFixed(2)),
      totalReceived: Number(totalReceived.toFixed(2)),
      netSpend: Number((totalSpent - totalReceived).toFixed(2)),
      txCount: slice.length,
      monthly: monthly satisfies MonthlyStats[],
      categoryBreakdown,
    };
  }

  private toCardTransactionResponse(transaction: CardRow): TransactionResponse {
    const status = transaction.status ?? CardTxStatus.SETTLED;
    const merchantName = transaction.merchantName ?? 'Card transaction';
    const fiatAmount = transaction.fiatAmount?.toString() ?? null;
    const fiatCurrency = transaction.fiatCurrency ?? null;
    const gasFee = cardGasFee(transaction);

    return {
      id: transaction.id,
      source: 'CARD',
      occurredAt: transaction.timestamp.toISOString(),
      title: merchantName,
      subtitle: status,
      amountPrimary: fiatAmount,
      currency: fiatCurrency?.toUpperCase() ?? null,
      direction:
        transactionDirection(transaction),
      categoryId: transaction.categoryId,
      categoryName: transaction.category?.name ?? null,
      categoryColor: transaction.category?.color ?? null,
      subcategoryId: transaction.subcategoryId,
      subcategoryName: transaction.subcategory?.name ?? null,
      subcategoryColor: transaction.subcategory?.color ?? null,
      notes: transaction.notes,
      externalId: transaction.externalId ?? null,
      merchantName,
      merchantRaw: transaction.merchantRaw ?? null,
      status,
      fiatAmount,
      fiatCurrency,
      cryptoAmount: transaction.cryptoAmount?.toString() ?? null,
      cryptoSymbol: transaction.cryptoSymbol ?? null,
      gasFeeAmount: gasFee?.amount ?? null,
      gasFeeSymbol: gasFee?.symbol ?? null,
      exchangeRate: cardExchangeRate(transaction),
      parserVersion: transaction.parserVersion ?? null,
      rawHtml: transaction.rawHtml ?? null,
    };
  }
}
