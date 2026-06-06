import { Injectable, NotFoundException } from '@nestjs/common';
import { CardTxStatus, Prisma } from '@crypto-tracker/db';
import type {
  CategoryBreakdown,
  Transaction as TransactionResponse,
  TripDetail,
  TripSummary,
} from '@crypto-tracker/shared';
import { PrismaService } from '../prisma/prisma.service';
import { ExchangeRateService } from '../common/exchange-rate/exchange-rate.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';

type RawTx = Prisma.TransactionGetPayload<object>;

type TripWithIncludes = Prisma.TripGetPayload<{
  include: {
    transactions: { include: { transaction: true } };
  };
}>;

const SPENDING_STATUSES: CardTxStatus[] = [CardTxStatus.SETTLED, CardTxStatus.PENDING];

function toTransactionDto(tx: RawTx): TransactionResponse {
  const status = tx.status ?? CardTxStatus.SETTLED;
  const fiatAmount = tx.fiatAmount?.toString() ?? null;
  const fiatCurrency = tx.fiatCurrency ?? null;
  const direction =
    status === CardTxStatus.REFUNDED
      ? 'INFLOW'
      : status === CardTxStatus.DECLINED
        ? 'NEUTRAL'
        : 'OUTFLOW';

  return {
    id: tx.id,
    source: 'CARD',
    occurredAt: tx.timestamp.toISOString(),
    title: tx.merchantName ?? 'Unknown',
    subtitle: null,
    amountPrimary: fiatAmount,
    currency: fiatCurrency?.toUpperCase() ?? null,
    direction,
    categoryId: tx.categoryId,
    categoryName: null,
    categoryColor: null,
    subcategoryId: tx.subcategoryId,
    subcategoryName: null,
    subcategoryColor: null,
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
    const currency = (tx.fiatCurrency ?? '').toUpperCase();
    if (!currency) continue;
    const bucket = map.get(currency) ?? { totalSpent: 0, totalReceived: 0 };
    const amount = Math.abs(Number(tx.fiatAmount ?? 0));
    if (tx.status === CardTxStatus.REFUNDED) {
      bucket.totalReceived += amount;
    } else if (tx.status && SPENDING_STATUSES.includes(tx.status as CardTxStatus)) {
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

function computeCategoryBreakdown(txs: RawTx[]): CategoryBreakdown[] {
  const catMap = new Map<string | null, { total: number; count: number }>();

  for (const tx of txs) {
    if (!tx.status || !SPENDING_STATUSES.includes(tx.status as CardTxStatus)) continue;
    const amount = Math.abs(Number(tx.fiatAmount ?? 0));
    const bucket = catMap.get(tx.categoryId) ?? { total: 0, count: 0 };
    bucket.total += amount;
    bucket.count += 1;
    catMap.set(tx.categoryId, bucket);
  }

  return Array.from(catMap.entries())
    .map(([categoryId, bucket]) => ({
      categoryId,
      categoryName: null,
      categoryColor: null,
      total: Number(bucket.total.toFixed(2)),
      count: bucket.count,
    }))
    .sort((a, b) => b.total - a.total);
}

function toSummary(trip: TripWithIncludes, rawTxs: RawTx[]): TripSummary {
  return {
    id: trip.id,
    name: trip.name,
    startAt: trip.startAt.toISOString(),
    endAt: trip.endAt.toISOString(),
    createdAt: trip.createdAt.toISOString(),
    transactionCount: rawTxs.length,
    totalsByCurrency: computeTotalsByCurrency(rawTxs),
  };
}

@Injectable()
export class TripsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fxService: ExchangeRateService,
  ) {}

  async create(userId: string, dto: CreateTripDto): Promise<TripSummary> {
    const transactions = await this.prisma.transaction.findMany({
      where: { id: { in: dto.transactionIds }, userId },
    });

    if (transactions.length !== dto.transactionIds.length) {
      throw new NotFoundException('One or more transactions not found or do not belong to user');
    }

    const timestamps = transactions.map((tx) => tx.timestamp.getTime());
    const startAt = new Date(Math.min(...timestamps));
    const endAt = new Date(Math.max(...timestamps));

    const trip = await this.prisma.$transaction(async (prisma) => {
      const created = await prisma.trip.create({
        data: {
          userId,
          name: dto.name,
          startAt,
          endAt,
          transactions: {
            create: dto.transactionIds.map((transactionId) => ({ transactionId })),
          },
        },
        include: {
          transactions: { include: { transaction: true } },
        },
      });
      return created;
    });

    return toSummary(trip, transactions);
  }

  async findAll(userId: string): Promise<TripSummary[]> {
    const trips = await this.prisma.trip.findMany({
      where: { userId },
      orderBy: { startAt: 'desc' },
      include: {
        transactions: { include: { transaction: true } },
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
        transactions: { include: { transaction: true } },
      },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    const rawTxs = trip.transactions.map((tt) => tt.transaction);
    const totalsByCurrency = computeTotalsByCurrency(rawTxs);

    let convertedTotal: { currency: string; totalSpent: number; totalReceived: number } | null = null;
    if (defaultCurrency) {
      const rates = await this.fxService.getRates(defaultCurrency);
      let totalSpent = 0;
      let totalReceived = 0;
      for (const tx of rawTxs) {
        const currency = (tx.fiatCurrency ?? '').toUpperCase();
        const amount = Math.abs(Number(tx.fiatAmount ?? 0));
        const rate = currency ? (rates[currency] ?? 1) : 1;
        const converted = amount / rate;
        if (tx.status === CardTxStatus.REFUNDED) {
          totalReceived += converted;
        } else if (tx.status && SPENDING_STATUSES.includes(tx.status as CardTxStatus)) {
          totalSpent += converted;
        }
      }
      convertedTotal = {
        currency: defaultCurrency.toUpperCase(),
        totalSpent: Number(totalSpent.toFixed(2)),
        totalReceived: Number(totalReceived.toFixed(2)),
      };
    }

    return {
      id: trip.id,
      name: trip.name,
      startAt: trip.startAt.toISOString(),
      endAt: trip.endAt.toISOString(),
      createdAt: trip.createdAt.toISOString(),
      transactionCount: rawTxs.length,
      totalsByCurrency,
      transactions: rawTxs.map(toTransactionDto),
      categoryBreakdown: computeCategoryBreakdown(rawTxs),
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
      data: { name: dto.name },
      include: {
        transactions: { include: { transaction: true } },
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
}
