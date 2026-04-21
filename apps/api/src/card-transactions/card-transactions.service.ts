import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CardTxStatus, Prisma } from '@crypto-tracker/db';
import type {
  CardSyncResult,
  CardTransaction as CardTransactionResponse,
  CardTransactionStats,
  PaginatedCardTransactions,
} from '@crypto-tracker/shared';
import { CardSyncBodySchema } from '@crypto-tracker/shared';
import { PrismaService } from '../prisma/prisma.service';
import { ListCardTransactionsDto } from './dto/list-card-transactions.dto';
import { UpdateCardTransactionDto } from './dto/update-card-transaction.dto';
import { CardStatsQueryDto } from './dto/card-stats-query.dto';

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

const SPENDING_STATUSES: CardTxStatus[] = [CardTxStatus.SETTLED, CardTxStatus.PENDING];

@Injectable()
export class CardTransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async sync(userId: string, rawBody: unknown): Promise<CardSyncResult> {
    const parsed = CardSyncBodySchema.safeParse(rawBody);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }
    const { items, parserVersion } = parsed.data;
    if (items.length === 0) {
      return { inserted: 0, updated: 0, skipped: 0 };
    }

    let inserted = 0;
    let updated = 0;

    const seen = new Map<string, (typeof items)[0]>();
    for (const item of items) {
      seen.set(item.externalId, item);
    }
    const uniqueItems = [...seen.values()];

    for (const item of uniqueItems) {
      const pv = item.parserVersion ?? parserVersion;
      const existing = await this.prisma.cardTransaction.findUnique({
        where: {
          userId_externalId: {
            userId,
            externalId: item.externalId,
          },
        },
        select: { id: true },
      });

      const occurredAt = new Date(item.occurredAt);
      const fiatAmount = new Prisma.Decimal(item.fiatAmount);
      const cryptoAmount =
        item.cryptoAmount === null || item.cryptoAmount === undefined
          ? null
          : new Prisma.Decimal(item.cryptoAmount);

      await this.prisma.cardTransaction.upsert({
        where: {
          userId_externalId: {
            userId,
            externalId: item.externalId,
          },
        },
        create: {
          userId,
          externalId: item.externalId,
          occurredAt,
          merchantName: item.merchantName,
          merchantRaw: item.merchantRaw ?? null,
          fiatAmount,
          fiatCurrency: item.fiatCurrency.toUpperCase(),
          cryptoAmount,
          cryptoSymbol: item.cryptoSymbol?.toUpperCase() ?? null,
          status: item.status as CardTxStatus,
          parserVersion: pv,
          rawHtml: item.rawHtml ?? null,
        },
        update: {
          occurredAt,
          merchantName: item.merchantName,
          merchantRaw: item.merchantRaw ?? null,
          fiatAmount,
          fiatCurrency: item.fiatCurrency.toUpperCase(),
          cryptoAmount,
          cryptoSymbol: item.cryptoSymbol?.toUpperCase() ?? null,
          status: item.status as CardTxStatus,
          parserVersion: pv,
          rawHtml: item.rawHtml ?? null,
        },
      });

      if (existing) {
        updated += 1;
      } else {
        inserted += 1;
      }
    }

    const skipped = items.length - uniqueItems.length;
    return { inserted, updated, skipped };
  }

  async list(userId: string, dto: ListCardTransactionsDto): Promise<PaginatedCardTransactions> {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 50;
    const skip = (page - 1) * limit;
    const where = this.buildWhere(userId, dto);

    const [rows, total] = await Promise.all([
      this.prisma.cardTransaction.findMany({
        where,
        orderBy: { occurredAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.cardTransaction.count({ where }),
    ]);

    return {
      items: rows.map((r) => this.toResponse(r)),
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async stats(userId: string, dto: CardStatsQueryDto): Promise<CardTransactionStats> {
    const where = this.buildWhere(userId, {
      from: dto.from,
      to: dto.to,
    } as ListCardTransactionsDto);
    const year = dto.from ? new Date(dto.from).getUTCFullYear() : dto.year ?? new Date().getUTCFullYear();

    const monthlyBase: Prisma.CardTransactionWhereInput = {
      ...where,
      occurredAt: {
        gte: parseFromDate(dto.from) ?? new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0)),
        lte: parseToDate(dto.to) ?? new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999)),
      },
    };

    const [transactions, monthlyTxs, categories] = await Promise.all([
      this.prisma.cardTransaction.findMany({
        where,
        orderBy: { occurredAt: 'desc' },
      }),
      this.prisma.cardTransaction.findMany({
        where: monthlyBase,
        orderBy: { occurredAt: 'asc' },
      }),
      this.prisma.category.findMany({
        select: { id: true, name: true, color: true },
      }),
    ]);

    const categoriesById = new Map(categories.map((c) => [c.id, c]));
    const monthly = Array.from({ length: 12 }, (_, index) => ({
      month: index + 1,
      year,
      spent: 0,
      received: 0,
    }));
    const categoryAccumulator = new Map<
      string | null,
      { categoryId: string | null; total: number; count: number }
    >();
    let totalSpent = 0;
    let totalReceived = 0;
    const totalGasFees = 0;

    for (const tx of transactions) {
      const amount = Number(tx.fiatAmount);
      if (tx.status === CardTxStatus.REFUNDED) {
        totalReceived += amount;
      } else if (SPENDING_STATUSES.includes(tx.status)) {
        totalSpent += amount;
      }

      const bucketKey = tx.categoryId ?? null;
      const current = categoryAccumulator.get(bucketKey) ?? {
        categoryId: bucketKey,
        total: 0,
        count: 0,
      };
      current.total += amount;
      current.count += 1;
      categoryAccumulator.set(bucketKey, current);
    }

    for (const tx of monthlyTxs) {
      const txYear = tx.occurredAt.getUTCFullYear();
      if (txYear !== year) continue;
      const monthIndex = tx.occurredAt.getUTCMonth();
      const amount = Number(tx.fiatAmount);
      if (tx.status === CardTxStatus.REFUNDED) {
        monthly[monthIndex]!.received += amount;
      } else if (SPENDING_STATUSES.includes(tx.status)) {
        monthly[monthIndex]!.spent += amount;
      }
    }

    const categoryBreakdown = Array.from(categoryAccumulator.values())
      .map((group) => {
        const category = group.categoryId ? categoriesById.get(group.categoryId) : null;
        return {
          categoryId: group.categoryId,
          categoryName: category?.name ?? null,
          categoryColor: category?.color ?? null,
          total: group.total,
          count: group.count,
        };
      })
      .sort((a, b) => b.total - a.total);

    return {
      totalSpent,
      totalReceived,
      totalGasFees,
      txCount: transactions.length,
      monthly,
      categoryBreakdown,
    };
  }

  async updateOne(userId: string, id: string, dto: UpdateCardTransactionDto): Promise<CardTransactionResponse> {
    const existing = await this.prisma.cardTransaction.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw new NotFoundException('Card transaction not found');
    }
    const updated = await this.prisma.cardTransaction.update({
      where: { id },
      data: {
        categoryId: dto.categoryId === undefined ? existing.categoryId : dto.categoryId,
        notes: dto.notes === undefined ? existing.notes : dto.notes,
      },
    });
    return this.toResponse(updated);
  }

  private buildWhere(
    userId: string,
    dto: Pick<ListCardTransactionsDto, 'categoryId' | 'status' | 'merchant' | 'from' | 'to' | 'search'>,
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
    if (dto.merchant) {
      where.merchantName = { contains: dto.merchant, mode: 'insensitive' };
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

  private toResponse(row: {
    id: string;
    userId: string;
    externalId: string;
    occurredAt: Date;
    merchantName: string;
    merchantRaw: string | null;
    fiatAmount: Prisma.Decimal;
    fiatCurrency: string;
    cryptoAmount: Prisma.Decimal | null;
    cryptoSymbol: string | null;
    status: CardTxStatus;
    categoryId: string | null;
    notes: string | null;
    parserVersion: number;
    rawHtml: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): CardTransactionResponse {
    return {
      id: row.id,
      userId: row.userId,
      externalId: row.externalId,
      occurredAt: row.occurredAt.toISOString(),
      merchantName: row.merchantName,
      merchantRaw: row.merchantRaw,
      fiatAmount: row.fiatAmount.toString(),
      fiatCurrency: row.fiatCurrency,
      cryptoAmount: row.cryptoAmount?.toString() ?? null,
      cryptoSymbol: row.cryptoSymbol,
      status: row.status,
      categoryId: row.categoryId,
      notes: row.notes,
      parserVersion: row.parserVersion,
      rawHtml: row.rawHtml,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
