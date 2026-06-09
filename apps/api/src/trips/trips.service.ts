import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CardTxStatus, Prisma, TransactionSource } from '@crypto-tracker/db';
import type {
  CategoryBreakdown,
  Transaction as TransactionResponse,
  TripDetail,
  TripPreview,
  TripSummary,
} from '@crypto-tracker/shared';
import { PrismaService } from '../prisma/prisma.service';
import { ExchangeRateService } from '../common/exchange-rate/exchange-rate.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { TripSelectionDto } from './dto/trip-selection.dto';

const txHydrate = {
  category: { select: { name: true, color: true } },
  subcategory: { select: { name: true, color: true } },
} satisfies Prisma.TransactionInclude;

const tripInclude = {
  transactions: { include: { transaction: { include: txHydrate } } },
} satisfies Prisma.TripInclude;

type RawTx = Prisma.TransactionGetPayload<{ include: typeof txHydrate }>;

type TripWithIncludes = Prisma.TripGetPayload<{
  include: typeof tripInclude;
}>;

type SelectionResolution = {
  transactions: RawTx[];
  startTransaction: RawTx;
  endTransaction: RawTx;
  startAt: Date;
  endAt: Date;
  automaticTransactionIds: string[];
  extraTransactionIds: string[];
  excludedTransactionIds: string[];
  currency: string;
};

const SPENDING_STATUSES: CardTxStatus[] = [CardTxStatus.SETTLED, CardTxStatus.PENDING];

function normalizeCurrency(value: string | null | undefined): string {
  return (value ?? '').trim().toUpperCase().slice(0, 8);
}

function transactionDirection(tx: Pick<RawTx, 'status' | 'fiatAmount'>): 'INFLOW' | 'OUTFLOW' | 'NEUTRAL' {
  const status = tx.status ?? CardTxStatus.SETTLED;
  if (status === CardTxStatus.DECLINED) return 'NEUTRAL';
  if (status === CardTxStatus.REFUNDED || Number(tx.fiatAmount ?? 0) > 0) return 'INFLOW';
  return 'OUTFLOW';
}

function isSpendTx(tx: RawTx): boolean {
  const status = tx.status ?? CardTxStatus.SETTLED;
  return SPENDING_STATUSES.includes(status) && transactionDirection(tx) === 'OUTFLOW';
}

function isReceivedTx(tx: RawTx): boolean {
  return transactionDirection(tx) === 'INFLOW';
}

function toTransactionDto(tx: RawTx): TransactionResponse {
  const status = tx.status ?? CardTxStatus.SETTLED;
  const fiatAmount = tx.fiatAmount?.toString() ?? null;
  const fiatCurrency = tx.fiatCurrency ?? null;

  return {
    id: tx.id,
    source: 'CARD',
    occurredAt: tx.timestamp.toISOString(),
    title: tx.merchantName ?? 'Unknown',
    subtitle: null,
    amountPrimary: fiatAmount,
    currency: fiatCurrency?.toUpperCase() ?? null,
    direction: transactionDirection(tx),
    categoryId: tx.categoryId,
    categoryName: tx.category?.name ?? null,
    categoryColor: tx.category?.color ?? null,
    subcategoryId: tx.subcategoryId,
    subcategoryName: tx.subcategory?.name ?? null,
    subcategoryColor: tx.subcategory?.color ?? null,
    notes: tx.notes,
    externalId: tx.externalId ?? null,
    merchantName: tx.merchantName ?? null,
    merchantRaw: tx.merchantRaw ?? null,
    status,
    fiatAmount,
    fiatCurrency,
    cryptoAmount: tx.cryptoAmount?.toString() ?? null,
    cryptoSymbol: tx.cryptoSymbol ?? null,
    gasFeeAmount: null,
    gasFeeSymbol: null,
    exchangeRate: null,
    parserVersion: tx.parserVersion ?? null,
    rawHtml: null,
  };
}

function computeTotalsByCurrency(
  txs: RawTx[],
): Array<{ currency: string; totalSpent: number; totalReceived: number }> {
  const map = new Map<string, { totalSpent: number; totalReceived: number }>();

  for (const tx of txs) {
    const currency = normalizeCurrency(tx.fiatCurrency);
    if (!currency) continue;
    const bucket = map.get(currency) ?? { totalSpent: 0, totalReceived: 0 };
    const amount = Math.abs(Number(tx.fiatAmount ?? 0));
    if (isReceivedTx(tx)) {
      bucket.totalReceived += amount;
    } else if (isSpendTx(tx)) {
      bucket.totalSpent += amount;
    }
    map.set(currency, bucket);
  }

  return Array.from(map.entries()).map(([currency, totals]) => ({
    currency,
    totalSpent: Number(totals.totalSpent.toFixed(2)),
    totalReceived: Number(totals.totalReceived.toFixed(2)),
  }));
}

async function convertedTotals(
  txs: RawTx[],
  targetCurrency: string,
  fxService: ExchangeRateService,
): Promise<{ currency: string; totalSpent: number; totalReceived: number }> {
  const currency = normalizeCurrency(targetCurrency);
  const rates = currency ? await fxService.getRates(currency) : {};
  let totalSpent = 0;
  let totalReceived = 0;

  for (const tx of txs) {
    const nativeCurrency = normalizeCurrency(tx.fiatCurrency);
    if (!nativeCurrency) continue;
    const rate = rates[nativeCurrency] ?? 1;
    const converted = Math.abs(Number(tx.fiatAmount ?? 0)) / rate;
    if (isReceivedTx(tx)) {
      totalReceived += converted;
    } else if (isSpendTx(tx)) {
      totalSpent += converted;
    }
  }

  return {
    currency,
    totalSpent: Number(totalSpent.toFixed(2)),
    totalReceived: Number(totalReceived.toFixed(2)),
  };
}

async function computeCategoryBreakdown(
  txs: RawTx[],
  targetCurrency: string,
  fxService: ExchangeRateService,
): Promise<CategoryBreakdown[]> {
  const rates = await fxService.getRates(targetCurrency);
  const catMap = new Map<string | null, { total: number; count: number }>();

  for (const tx of txs) {
    if (!isSpendTx(tx)) continue;
    const nativeCurrency = normalizeCurrency(tx.fiatCurrency);
    const rate = nativeCurrency ? (rates[nativeCurrency] ?? 1) : 1;
    const amount = Math.abs(Number(tx.fiatAmount ?? 0)) / rate;
    const bucket = catMap.get(tx.categoryId) ?? { total: 0, count: 0 };
    bucket.total += amount;
    bucket.count += 1;
    catMap.set(tx.categoryId, bucket);
  }

  return Array.from(catMap.entries())
    .map(([categoryId, bucket]) => ({
      categoryId,
      categoryName: categoryId
        ? txs.find((tx) => tx.categoryId === categoryId)?.category?.name ?? null
        : null,
      categoryColor: categoryId
        ? txs.find((tx) => tx.categoryId === categoryId)?.category?.color ?? null
        : null,
      total: Number(bucket.total.toFixed(2)),
      count: bucket.count,
    }))
    .sort((a, b) => b.total - a.total);
}

function toSummary(trip: TripWithIncludes, rawTxs: RawTx[]): TripSummary {
  return {
    id: trip.id,
    name: trip.name,
    currency: trip.currency,
    startAt: trip.startAt.toISOString(),
    endAt: trip.endAt.toISOString(),
    createdAt: trip.createdAt.toISOString(),
    transactionCount: rawTxs.length,
    totalsByCurrency: computeTotalsByCurrency(rawTxs),
  };
}

function pickTripCurrency(txs: RawTx[]): string {
  const stats = new Map<string, { count: number; absTotal: number }>();
  for (const tx of txs) {
    const currency = normalizeCurrency(tx.fiatCurrency);
    if (!currency) continue;
    const bucket = stats.get(currency) ?? { count: 0, absTotal: 0 };
    bucket.count += 1;
    bucket.absTotal += Math.abs(Number(tx.fiatAmount ?? 0));
    stats.set(currency, bucket);
  }

  return (
    [...stats.entries()].sort((left, right) => {
      const countSort = right[1].count - left[1].count;
      if (countSort !== 0) return countSort;
      const totalSort = right[1].absTotal - left[1].absTotal;
      if (totalSort !== 0) return totalSort;
      return left[0].localeCompare(right[0]);
    })[0]?.[0] ?? 'EUR'
  );
}

function uniqueIds(values: string[] | null | undefined): string[] {
  return [...new Set((values ?? []).map((value) => value.trim()).filter(Boolean))];
}

function sortByTimestamp(txs: RawTx[]): RawTx[] {
  return [...txs].sort((left, right) => {
    const timestampSort = left.timestamp.getTime() - right.timestamp.getTime();
    if (timestampSort !== 0) return timestampSort;
    return left.id.localeCompare(right.id);
  });
}

function isSchemaDriftError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /trips|Trip|currency|column|does not exist|migration/iu.test(message);
}

function toPreview(selection: SelectionResolution): TripPreview {
  return {
    startAt: selection.startAt.toISOString(),
    endAt: selection.endAt.toISOString(),
    currency: selection.currency,
    transactionCount: selection.transactions.length,
    totalsByCurrency: computeTotalsByCurrency(selection.transactions),
    transactions: selection.transactions.map(toTransactionDto),
    startTransaction: toTransactionDto(selection.startTransaction),
    endTransaction: toTransactionDto(selection.endTransaction),
    automaticTransactionIds: selection.automaticTransactionIds,
    extraTransactionIds: selection.extraTransactionIds,
    excludedTransactionIds: selection.excludedTransactionIds,
  };
}

@Injectable()
export class TripsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fxService: ExchangeRateService,
  ) {}

  async preview(userId: string, dto: TripSelectionDto): Promise<TripPreview> {
    return toPreview(await this.resolveSelection(userId, dto));
  }

  async create(userId: string, dto: CreateTripDto): Promise<TripSummary> {
    const selection = await this.resolveSelection(userId, dto);
    const { transactions } = selection;

    if (transactions.length < 2) {
      throw new BadRequestException('A trip requires at least two transactions');
    }

    let trip: TripWithIncludes;
    try {
      trip = await this.prisma.$transaction(async (prisma) => {
        const created = await prisma.trip.create({
          data: {
            userId,
            name: dto.name,
            currency: selection.currency,
            startAt: selection.startAt,
            endAt: selection.endAt,
            transactions: {
              create: transactions.map((tx) => ({ transactionId: tx.id })),
            },
          },
          include: tripInclude,
        });
        return created;
      });
    } catch (error) {
      if (isSchemaDriftError(error)) {
        throw new BadRequestException(
          'Trips database schema is not up to date. Apply the latest Prisma migration and restart the API.',
        );
      }
      throw error;
    }

    return toSummary(trip, transactions);
  }

  async findAll(userId: string): Promise<TripSummary[]> {
    const trips = await this.prisma.trip.findMany({
      where: { userId },
      orderBy: { startAt: 'desc' },
      include: {
        transactions: { include: { transaction: { include: txHydrate } } },
      },
    });

    return trips.map((trip) => {
      const rawTxs = trip.transactions.map((tt) => tt.transaction);
      return toSummary(trip, rawTxs);
    });
  }

  async findOne(userId: string, tripId: string, defaultCurrency?: string): Promise<TripDetail> {
    const trip = await this.prisma.trip.findFirst({
      where: { id: tripId, userId },
      include: {
        transactions: { include: { transaction: { include: txHydrate } } },
      },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    const rawTxs = trip.transactions.map((tt) => tt.transaction);
    const totalsByCurrency = computeTotalsByCurrency(rawTxs);
    const targetCurrency = normalizeCurrency(defaultCurrency) || trip.currency;
    const convertedTotal = await convertedTotals(rawTxs, targetCurrency, this.fxService);
    const categoryBreakdown = await computeCategoryBreakdown(rawTxs, targetCurrency, this.fxService);

    return {
      id: trip.id,
      name: trip.name,
      currency: trip.currency,
      startAt: trip.startAt.toISOString(),
      endAt: trip.endAt.toISOString(),
      createdAt: trip.createdAt.toISOString(),
      transactionCount: rawTxs.length,
      totalsByCurrency,
      transactions: rawTxs.map(toTransactionDto),
      categoryBreakdown,
      convertedTotal,
    };
  }

  async update(userId: string, tripId: string, dto: UpdateTripDto): Promise<TripSummary> {
    const existing = await this.prisma.trip.findFirst({
      where: { id: tripId, userId },
    });

    if (!existing) {
      throw new NotFoundException('Trip not found');
    }

    const trip = await this.prisma.trip.update({
      where: { id: tripId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.currency !== undefined ? { currency: normalizeCurrency(dto.currency) } : {}),
      },
      include: {
        transactions: { include: { transaction: { include: txHydrate } } },
      },
    });

    const rawTxs = trip.transactions.map((tt) => tt.transaction);
    return toSummary(trip, rawTxs);
  }

  async remove(userId: string, tripId: string): Promise<void> {
    const existing = await this.prisma.trip.findFirst({
      where: { id: tripId, userId },
    });

    if (!existing) {
      throw new NotFoundException('Trip not found');
    }

    await this.prisma.trip.delete({ where: { id: tripId } });
  }

  private async resolveSelection(userId: string, dto: TripSelectionDto): Promise<SelectionResolution> {
    if (dto.startTransactionId && dto.endTransactionId) {
      if (dto.startTransactionId === dto.endTransactionId) {
        throw new BadRequestException('Choose two different transactions for the trip range');
      }

      const bounds = await this.prisma.transaction.findMany({
        where: {
          userId,
          source: TransactionSource.CARD,
          id: { in: [dto.startTransactionId, dto.endTransactionId] },
        },
        include: txHydrate,
      });

      if (bounds.length !== 2) {
        throw new NotFoundException('Start or end transaction not found');
      }

      const startRaw = bounds.find((tx) => tx.id === dto.startTransactionId);
      const endRaw = bounds.find((tx) => tx.id === dto.endTransactionId);
      if (!startRaw || !endRaw) {
        throw new NotFoundException('Start or end transaction not found');
      }

      const [startTransaction, endTransaction] =
        startRaw.timestamp <= endRaw.timestamp ? [startRaw, endRaw] : [endRaw, startRaw];
      const startAt = startTransaction.timestamp;
      const endAt = endTransaction.timestamp;

      const automaticTransactions = await this.prisma.transaction.findMany({
        where: {
          userId,
          source: TransactionSource.CARD,
          timestamp: { gte: startAt, lte: endAt },
        },
        orderBy: { timestamp: 'asc' },
        include: txHydrate,
      });

      const automaticIds = new Set(automaticTransactions.map((tx) => tx.id));
      const includeIds = uniqueIds(dto.includeTransactionIds);
      const extraIdsToFetch = includeIds.filter((id) => !automaticIds.has(id));
      const extraTransactions =
        extraIdsToFetch.length > 0
          ? await this.prisma.transaction.findMany({
              where: {
                userId,
                source: TransactionSource.CARD,
                id: { in: extraIdsToFetch },
              },
              include: txHydrate,
            })
          : [];

      if (extraTransactions.length !== extraIdsToFetch.length) {
        throw new NotFoundException('One or more extra transactions were not found');
      }

      const excluded = new Set(uniqueIds(dto.excludeTransactionIds));
      excluded.delete(startTransaction.id);
      excluded.delete(endTransaction.id);

      const byId = new Map<string, RawTx>();
      for (const tx of [...automaticTransactions, ...extraTransactions]) {
        if (!excluded.has(tx.id)) byId.set(tx.id, tx);
      }

      const transactions = sortByTimestamp([...byId.values()]);
      const extraTransactionIds = extraTransactions
        .filter((tx) => !excluded.has(tx.id))
        .map((tx) => tx.id);
      const excludedTransactionIds = automaticTransactions
        .filter((tx) => excluded.has(tx.id))
        .map((tx) => tx.id);

      return {
        transactions,
        startTransaction,
        endTransaction,
        startAt,
        endAt,
        automaticTransactionIds: automaticTransactions.map((tx) => tx.id),
        extraTransactionIds,
        excludedTransactionIds,
        currency: pickTripCurrency(transactions),
      };
    }

    if (dto.startTransactionId || dto.endTransactionId) {
      throw new BadRequestException('Provide both startTransactionId and endTransactionId');
    }

    if (dto.transactionIds?.length) {
      const transactions = await this.prisma.transaction.findMany({
        where: { id: { in: dto.transactionIds }, userId, source: TransactionSource.CARD },
        orderBy: { timestamp: 'asc' },
        include: txHydrate,
      });

      if (transactions.length !== dto.transactionIds.length) {
        throw new NotFoundException('One or more transactions not found or do not belong to user');
      }

      const sorted = sortByTimestamp(transactions);
      const startTransaction = sorted[0];
      const endTransaction = sorted[sorted.length - 1];
      if (!startTransaction || !endTransaction) {
        throw new BadRequestException('A trip requires at least two transactions');
      }

      return {
        transactions: sorted,
        startTransaction,
        endTransaction,
        startAt: startTransaction.timestamp,
        endAt: endTransaction.timestamp,
        automaticTransactionIds: sorted.map((tx) => tx.id),
        extraTransactionIds: [],
        excludedTransactionIds: [],
        currency: pickTripCurrency(sorted),
      };
    }

    throw new BadRequestException('Provide transactionIds or startTransactionId/endTransactionId');
  }
}
