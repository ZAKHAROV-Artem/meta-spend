import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CardTxStatus, Prisma, TransactionSource } from '@crypto-tracker/db';
import type {
  CardSyncResult,
  PaginatedTransactions,
  Transaction as TransactionResponse,
} from '@crypto-tracker/shared';
import { CardSyncBodySchema, normalizeMerchantKey } from '@crypto-tracker/shared';
import { PrismaService } from '../prisma/prisma.service';
import { ListCardTransactionsDto } from './dto/list-card-transactions.dto';
import { UpdateCardTransactionDto } from './dto/update-card-transaction.dto';
import { CardCategorizationRunService } from './card-categorization-run.service';

function mergeCardRawData(
  existing: Prisma.JsonValue | null | undefined,
  fundingSourceMasked: string | null | undefined,
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
    cardScrape:
      fundingSourceMasked != null && fundingSourceMasked !== ''
        ? { ...prevScrape, fundingSourceMasked }
        : { ...prevScrape },
  } as Prisma.InputJsonValue;
}

type CardRowDb = Prisma.TransactionGetPayload<{
  include: {
    category: { select: { name: true, color: true } };
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
      const existing = await this.prisma.transaction.findUnique({
        where: {
          userId_source_externalId: {
            userId,
            source: TransactionSource.CARD,
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

      const existingRow = existing
        ? await this.prisma.transaction.findUnique({
            where: { id: existing.id },
            select: { rawData: true },
          })
        : null;

      const rawDataMerged = mergeCardRawData(existingRow?.rawData ?? null, item.fundingSourceMasked);

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

      if (existing) {
        updated += 1;
      } else {
        inserted += 1;
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
    await this.prisma.transaction.update({
      where: { id },
      data: {
        categoryId: dto.categoryId === undefined ? existing.categoryId : dto.categoryId,
        notes: dto.notes === undefined ? existing.notes : dto.notes,
      },
    });
    const hydrated = await this.prisma.transaction.findFirstOrThrow({
      where: { id, userId, source: TransactionSource.CARD },
      include: {
        category: { select: { name: true, color: true } },
      },
    });
    const nextCat = dto.categoryId === undefined ? existing.categoryId : dto.categoryId;
    if (nextCat && hydrated.merchantName) {
      await this.persistMerchantMemory(userId, hydrated.merchantName, nextCat, 'manual');
    }
    return this.toResponse(hydrated);
  }

  private async persistMerchantMemory(
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

  private buildWhere(
    userId: string,
    dto: Pick<ListCardTransactionsDto, 'categoryId' | 'status' | 'merchant' | 'from' | 'to' | 'search'>,
  ): Prisma.TransactionWhereInput {
    const from = parseFromDate(dto.from);
    const to = parseToDate(dto.to);
    const where: Prisma.TransactionWhereInput = { userId, source: TransactionSource.CARD };

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

    return {
      id: row.id,
      source: 'CARD',
      occurredAt: row.timestamp.toISOString(),
      title: merchantName,
      subtitle: status,
      amountPrimary: fiatAmount,
      currency: fiatCurrency?.toUpperCase() ?? null,
      direction:
        status === CardTxStatus.REFUNDED ? 'INFLOW' : status === CardTxStatus.DECLINED ? 'NEUTRAL' : 'OUTFLOW',
      categoryId: row.categoryId,
      categoryName: row.category?.name ?? null,
      categoryColor: row.category?.color ?? null,
      notes: row.notes,
      externalId: row.externalId ?? null,
      merchantName,
      merchantRaw: row.merchantRaw,
      status,
      fiatAmount,
      fiatCurrency,
      cryptoAmount: row.cryptoAmount?.toString() ?? null,
      cryptoSymbol: row.cryptoSymbol,
      parserVersion: row.parserVersion,
      rawHtml: row.rawHtml,
    };
  }
}
