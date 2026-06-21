import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CardTxStatus, Prisma, TransactionSource } from '@metaspend/db';
import type {
  CardSyncResult,
  PaginatedTransactions,
  Transaction as TransactionResponse,
} from '@metaspend/shared';
import { CardSyncBodySchema, normalizeMerchantKey } from '@metaspend/shared';
import { PrismaService } from '../prisma/prisma.service';
import { ListCardTransactionsDto } from './dto/list-card-transactions.dto';
import { UpdateCardTransactionDto } from './dto/update-card-transaction.dto';
import { CardCategorizationRunService } from './card-categorization-run.service';
import { cardExchangeRate, cardGasFee } from '../transactions/card-transaction-metrics';

function mergeCardRawData(
  existing: Prisma.JsonValue | null | undefined,
  cardScrape: {
    fundingSourceMasked?: string | null;
    gasFeeAmount?: string | null;
    gasFeeSymbol?: string | null;
    gasFeeRaw?: string | null;
    spentRaw?: string | null;
    creditedRaw?: string | null;
    creditDestinationMasked?: string | null;
  },
): Prisma.InputJsonValue {
  const base =
    existing && typeof existing === 'object' && !Array.isArray(existing)
      ? { ...(existing as Record<string, unknown>) }
      : {};
  const prevScrape =
    typeof base['cardScrape'] === 'object' && base['cardScrape'] !== null && !Array.isArray(base['cardScrape'])
      ? { ...(base['cardScrape'] as Record<string, unknown>) }
      : {};

  return {
    ...base,
    cardScrape: {
      ...prevScrape,
      ...(cardScrape.fundingSourceMasked ? { fundingSourceMasked: cardScrape.fundingSourceMasked } : {}),
      ...(cardScrape.gasFeeAmount ? { gasFeeAmount: cardScrape.gasFeeAmount } : {}),
      ...(cardScrape.gasFeeSymbol ? { gasFeeSymbol: cardScrape.gasFeeSymbol.toUpperCase() } : {}),
      ...(cardScrape.gasFeeRaw ? { gasFeeRaw: cardScrape.gasFeeRaw } : {}),
      ...(cardScrape.spentRaw ? { spentRaw: cardScrape.spentRaw } : {}),
      ...(cardScrape.creditedRaw ? { creditedRaw: cardScrape.creditedRaw } : {}),
      ...(cardScrape.creditDestinationMasked ? { creditDestinationMasked: cardScrape.creditDestinationMasked } : {}),
    },
  } as Prisma.InputJsonValue;
}

type CardRowDb = Prisma.TransactionGetPayload<{
  include: {
    category: { select: { name: true; color: true } };
    subcategory: { select: { name: true; color: true } };
  };
}>;

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

function transactionDirection(row: Pick<CardRowDb, 'status' | 'fiatAmount'>): 'INFLOW' | 'OUTFLOW' | 'NEUTRAL' {
  const status = row.status ?? CardTxStatus.SETTLED;
  if (status === CardTxStatus.DECLINED) return 'NEUTRAL';
  if (status === CardTxStatus.REFUNDED || Number(row.fiatAmount ?? 0) > 0) return 'INFLOW';
  return 'OUTFLOW';
}

@Injectable()
export class CardTransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly categorizationRuns: CardCategorizationRunService,
  ) {}

  async sync(userId: string, rawBody: unknown): Promise<CardSyncResult> {
    const parsed = CardSyncBodySchema.safeParse(rawBody);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }
    const { items, parserVersion, cardBalanceSnapshot } = parsed.data;

    if (cardBalanceSnapshot) {
      await this.prisma.portfolioAccount.updateMany({
        where: { userId },
        data: {
          cardBalanceAmount: new Prisma.Decimal(cardBalanceSnapshot.amount),
          cardBalanceCurrency: cardBalanceSnapshot.currency,
          lastSuccessfulSyncAt: new Date(),
        },
      });
    }

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

    const externalIds = uniqueItems.map((item) => item.externalId);
    const existingRows =
      externalIds.length > 0
        ? await this.prisma.transaction.findMany({
            where: {
              userId,
              source: TransactionSource.CARD,
              externalId: { in: externalIds },
            },
            select: { externalId: true, rawData: true },
          })
        : [];
    const existingByExternalId = new Map(existingRows.map((r) => [r.externalId, r]));

    const CONCURRENCY = 10;

    for (let start = 0; start < uniqueItems.length; start += CONCURRENCY) {
      const slice = uniqueItems.slice(start, start + CONCURRENCY);
      const deltas = await Promise.all(
        slice.map(async (item) => {
          const pv = item.parserVersion ?? parserVersion;
          const prior = existingByExternalId.get(item.externalId);
          const occurredAt = new Date(item.occurredAt);
          const fiatAmount = new Prisma.Decimal(item.fiatAmount);
          const cryptoAmount =
            item.cryptoAmount === null || item.cryptoAmount === undefined
              ? null
              : new Prisma.Decimal(item.cryptoAmount);

          const rawDataMerged = mergeCardRawData(prior?.rawData ?? null, {
            fundingSourceMasked: item.fundingSourceMasked,
            gasFeeAmount: item.gasFeeAmount ?? null,
            gasFeeSymbol: item.gasFeeSymbol ?? null,
            gasFeeRaw: item.gasFeeRaw ?? null,
            spentRaw: item.spentRaw ?? null,
            creditedRaw: item.creditedRaw ?? null,
            creditDestinationMasked: item.creditDestinationMasked ?? null,
          });

          await this.prisma.transaction.upsert({
            where: {
              userId_source_externalId: {
                userId,
                source: TransactionSource.CARD,
                externalId: item.externalId,
              },
            },
            create: {
              userId,
              source: TransactionSource.CARD,
              externalId: item.externalId,
              timestamp: occurredAt,
              merchantName: item.merchantName,
              merchantRaw: item.merchantRaw ?? null,
              fiatAmount,
              fiatCurrency: item.fiatCurrency.toUpperCase(),
              cryptoAmount,
              cryptoSymbol: item.cryptoSymbol?.toUpperCase() ?? null,
              status: item.status as CardTxStatus,
              parserVersion: pv,
              rawHtml: item.rawHtml ?? null,
              rawData: rawDataMerged,
            },
            update: {
              timestamp: occurredAt,
              merchantName: item.merchantName,
              merchantRaw: item.merchantRaw ?? null,
              fiatAmount,
              fiatCurrency: item.fiatCurrency.toUpperCase(),
              cryptoAmount,
              cryptoSymbol: item.cryptoSymbol?.toUpperCase() ?? null,
              status: item.status as CardTxStatus,
              parserVersion: pv,
              rawHtml: item.rawHtml ?? null,
              rawData: rawDataMerged,
            },
          });

          return prior ? ('updated' as const) : ('inserted' as const);
        }),
      );

      for (const d of deltas) {
        if (d === 'updated') updated += 1;
        else inserted += 1;
      }
    }

    await this.categorizationRuns.scheduleAfterSync(userId);

    const skipped = items.length - uniqueItems.length;
    return { inserted, updated, skipped };
  }

  async list(userId: string, dto: ListCardTransactionsDto): Promise<PaginatedTransactions> {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 50;
    const skip = (page - 1) * limit;
    const where = this.buildWhere(userId, dto);

    const [rows, total] = await Promise.all([
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
      items: rows.map((r) => this.toResponse(r)),
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async updateOne(userId: string, id: string, dto: UpdateCardTransactionDto): Promise<TransactionResponse> {
    const existing = await this.prisma.transaction.findFirst({
      where: { id, userId, source: TransactionSource.CARD },
    });
    if (!existing) {
      throw new NotFoundException('Card transaction not found');
    }

    const nextCategoryId = dto.categoryId === undefined ? existing.categoryId : dto.categoryId;
    const nextSubcategoryId = dto.subcategoryId === undefined ? existing.subcategoryId : dto.subcategoryId;

    if (nextSubcategoryId && nextCategoryId) {
      const sub = await this.prisma.category.findUnique({ where: { id: nextSubcategoryId } });
      if (!sub || sub.parentId !== nextCategoryId) {
        throw new BadRequestException('Subcategory does not belong to the selected category');
      }
    }

    await this.prisma.transaction.update({
      where: { id },
      data: {
        categoryId: nextCategoryId,
        subcategoryId: nextSubcategoryId,
        notes: dto.notes === undefined ? existing.notes : dto.notes,
      },
    });

    const hydrated = await this.prisma.transaction.findFirstOrThrow({
      where: { id, userId, source: TransactionSource.CARD },
      include: {
        category: { select: { name: true, color: true } },
        subcategory: { select: { name: true, color: true } },
      },
    });

    if (nextCategoryId && hydrated.merchantName) {
      await this.persistMerchantMemory(userId, hydrated.merchantName, nextCategoryId, nextSubcategoryId ?? null, 'manual');
    }
    return this.toResponse(hydrated);
  }

  private async persistMerchantMemory(
    userId: string,
    merchantName: string,
    categoryId: string,
    subcategoryId: string | null,
    learnedSource: 'manual' | 'ai',
  ): Promise<void> {
    const merchantKey = normalizeMerchantKey(merchantName);
    if (!merchantKey) return;
    await this.prisma.cardMerchantMemory.upsert({
      where: { userId_merchantKey: { userId, merchantKey } },
      create: { userId, merchantKey, categoryId, subcategoryId, learnedSource },
      update: { categoryId, subcategoryId, learnedSource },
    });
  }

  private buildWhere(
    userId: string,
    dto: Pick<ListCardTransactionsDto, 'categoryId' | 'subcategoryId' | 'status' | 'merchant' | 'from' | 'to' | 'search'>,
  ): Prisma.TransactionWhereInput {
    const from = parseFromDate(dto.from);
    const to = parseToDate(dto.to);
    const where: Prisma.TransactionWhereInput = { userId, source: TransactionSource.CARD };

    if (dto.categoryId) {
      where.categoryId = dto.categoryId;
    }
    if (dto.subcategoryId) {
      where.subcategoryId = dto.subcategoryId;
    }
    if (dto.status) {
      where.status = dto.status;
    }
    if (dto.merchant) {
      where.merchantName = { contains: dto.merchant, mode: 'insensitive' };
    }
    if (from || to) {
      where.timestamp = {
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

  private toResponse(row: CardRowDb): TransactionResponse {
    const status = row.status ?? CardTxStatus.SETTLED;
    const merchantName = row.merchantName ?? 'Card transaction';
    const fiatAmount = row.fiatAmount?.toString() ?? null;
    const fiatCurrency = row.fiatCurrency ?? null;
    const gasFee = cardGasFee(row);

    return {
      id: row.id,
      source: 'CARD',
      occurredAt: row.timestamp.toISOString(),
      title: merchantName,
      subtitle: status,
      amountPrimary: fiatAmount,
      currency: fiatCurrency?.toUpperCase() ?? null,
      direction:
        transactionDirection(row),
      categoryId: row.categoryId,
      categoryName: row.category?.name ?? null,
      categoryColor: row.category?.color ?? null,
      subcategoryId: row.subcategoryId,
      subcategoryName: row.subcategory?.name ?? null,
      subcategoryColor: row.subcategory?.color ?? null,
      notes: row.notes,
      externalId: row.externalId ?? null,
      merchantName,
      merchantRaw: row.merchantRaw,
      status,
      fiatAmount,
      fiatCurrency,
      cryptoAmount: row.cryptoAmount?.toString() ?? null,
      cryptoSymbol: row.cryptoSymbol,
      gasFeeAmount: gasFee?.amount ?? null,
      gasFeeSymbol: gasFee?.symbol ?? null,
      exchangeRate: cardExchangeRate(row),
      parserVersion: row.parserVersion,
      rawHtml: row.rawHtml,
    };
  }
}
