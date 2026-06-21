import { Injectable, Logger } from '@nestjs/common';
import { CardTxStatus, CategorizationRunStatus, TransactionSource } from '@metaspend/db';
import type {
  CardCategorizationRunChunkLogEntry,
  CardCategorizationRunDto,
  CardCategorizationRunMeta,
} from '@metaspend/shared';
import { normalizeMerchantKey } from '@metaspend/shared';
import { PrismaService } from '../prisma/prisma.service';
import { CardMerchantOpenAiService } from '../transactions/card-merchant-openai.service';

const USER_JOB_LOCK_MS = 30_000;

type ChunkLogEntry = CardCategorizationRunChunkLogEntry;

@Injectable()
export class CardCategorizationRunService {
  private readonly logger = new Logger(CardCategorizationRunService.name);
  /** Serializes categorization scheduling per user in-process */
  private readonly userEnqueueLocks = new Map<string, number>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly cardMerchantOpenAi: CardMerchantOpenAiService,
  ) {}

  /**
   * After card sync: if there is work, create a run and kick off processing in background.
   */
  async scheduleAfterSync(userId: string): Promise<void> {
    const eligibleWhere = this.uncategorizedEligibleWhere(userId);

    const pending = await this.prisma.transaction.count({ where: eligibleWhere });
    if (pending === 0) return;

    const existing = await this.prisma.cardCategorizationRun.findFirst({
      where: { userId, status: { in: [CategorizationRunStatus.QUEUED, CategorizationRunStatus.RUNNING] } },
      orderBy: { id: 'desc' },
    });
    if (existing) {
      return;
    }

    const now = Date.now();
    const last = this.userEnqueueLocks.get(userId);
    if (last && now - last < USER_JOB_LOCK_MS) {
      return;
    }
    this.userEnqueueLocks.set(userId, now);

    try {
      const run = await this.prisma.cardCategorizationRun.create({
        data: {
          userId,
          trigger: 'sync',
          status: CategorizationRunStatus.QUEUED,
          scannedTxCount: pending,
        },
      });

      setImmediate(() => {
        void this.executeRun(run.id).catch((err) => {
          this.logger.error(`Categorization run ${run.id} failed`, err instanceof Error ? err.stack : undefined);
        });
      });
    } finally {
      setTimeout(() => this.userEnqueueLocks.delete(userId), USER_JOB_LOCK_MS);
    }
  }

  async listRuns(userId: string, limit = 30): Promise<CardCategorizationRunDto[]> {
    const rows = await this.prisma.cardCategorizationRun.findMany({
      where: { userId },
      orderBy: { id: 'desc' },
      take: limit,
    });
    return rows.map((r) => ({
      id: r.id,
      status: String(r.status),
      trigger: r.trigger,
      startedAt: r.startedAt?.toISOString() ?? null,
      finishedAt: r.finishedAt?.toISOString() ?? null,
      scannedTxCount: r.scannedTxCount,
      scannedMerchantCount: r.scannedMerchantCount,
      memoryMatchedCount: r.memoryMatchedCount,
      aiUpdatedCount: r.aiUpdatedCount,
      skippedCount: r.skippedCount,
      errorMessage: r.errorMessage ?? null,
      meta: (r.meta as CardCategorizationRunMeta | null) ?? null,
    }));
  }

  private uncategorizedEligibleWhere(userId: string) {
    return {
      userId,
      source: TransactionSource.CARD,
      categoryId: null,
      merchantName: { not: null } as const,
      status: { not: CardTxStatus.DECLINED },
    };
  }

  /** Apply merchant memory lookup to uncategorized txs; returns rows updated */
  async applyMerchantMemoryMatches(userId: string): Promise<number> {
    const memories = await this.prisma.cardMerchantMemory.findMany({
      where: { userId },
      select: { merchantKey: true, categoryId: true, subcategoryId: true },
    });
    const memoryByKey = new Map(memories.map((m) => [m.merchantKey, { categoryId: m.categoryId, subcategoryId: m.subcategoryId }]));
    if (memoryByKey.size === 0) return 0;

    const rows = await this.prisma.transaction.findMany({
      where: this.uncategorizedEligibleWhere(userId),
      select: { id: true, merchantName: true },
    });

    const idsByMerchantKey = new Map<string, string[]>();
    for (const row of rows) {
      const key = normalizeMerchantKey(row.merchantName);
      if (!key) continue;
      if (!memoryByKey.has(key)) continue;
      const list = idsByMerchantKey.get(key) ?? [];
      list.push(row.id);
      idsByMerchantKey.set(key, list);
    }

    let updated = 0;
    for (const [merchantKey, ids] of idsByMerchantKey) {
      const entry = memoryByKey.get(merchantKey);
      if (!entry?.categoryId) continue;
      const res = await this.prisma.transaction.updateMany({
        where: {
          userId,
          source: TransactionSource.CARD,
          categoryId: null,
          id: { in: ids },
        },
        data: { categoryId: entry.categoryId, subcategoryId: entry.subcategoryId },
      });
      updated += res.count;
      if (res.count > 0) {
        await this.prisma.cardMerchantMemory.update({
          where: { userId_merchantKey: { userId, merchantKey } },
          data: { hitCount: { increment: res.count } },
        });
      }
    }
    return updated;
  }

  /**
   * Run OpenAI for remaining uncategorized merchants; persist memory for assigned groups.
   */
  async classifyUncategorizedMerchantsWithAi(userId: string, runId?: string): Promise<{
    processedMerchants: number;
    assignedMerchantCount: number;
    skippedMerchantCount: number;
    updatedTransactionCount: number;
    errors: string[];
    chunks: ChunkLogEntry[];
  }> {
    const categories = await this.prisma.category.findMany({
      where: { userId, parentId: null },
      select: { id: true, name: true, subCategories: { select: { id: true, name: true } } },
    });
    if (categories.length === 0) {
      return {
        processedMerchants: 0,
        assignedMerchantCount: 0,
        skippedMerchantCount: 0,
        updatedTransactionCount: 0,
        errors: [],
        chunks: [],
      };
    }

    const txs = await this.prisma.transaction.findMany({
      where: this.uncategorizedEligibleWhere(userId),
      select: { id: true, merchantName: true },
    });

    const byKey = new Map<string, { displayName: string; ids: string[] }>();

    for (const tx of txs) {
      const key = normalizeMerchantKey(tx.merchantName);
      if (!key) continue;
      const name = (tx.merchantName ?? 'Card transaction').trim();
      let entry = byKey.get(key);
      if (!entry) {
        entry = { displayName: name, ids: [] };
        byKey.set(key, entry);
      }
      entry.ids.push(tx.id);
    }

    const processedMerchants = byKey.size;

    if (processedMerchants === 0) {
      return {
        processedMerchants: 0,
        assignedMerchantCount: 0,
        skippedMerchantCount: 0,
        updatedTransactionCount: 0,
        errors: [],
        chunks: [],
      };
    }

    const merchantsPayload = [...byKey.entries()].map(([merchantKey, v]) => ({
      merchantKey,
      sampleTitle: v.displayName,
    }));

    const CHUNK = 40;
    const categoryPayload = categories.map((c) => ({ id: c.id, name: c.name, subCategories: c.subCategories }));
    const totalChunks = Math.ceil(merchantsPayload.length / CHUNK);

    const errors: string[] = [];
    let assignedMerchantCount = 0;
    let skippedMerchantCount = 0;
    let updatedTransactionCount = 0;
    const chunkLog: ChunkLogEntry[] = [];

    for (let i = 0, chunkIndex = 0; i < merchantsPayload.length; i += CHUNK, chunkIndex++) {
      const chunk = merchantsPayload.slice(i, i + CHUNK);
      let chunkAssignedCount = 0;
      let chunkSkippedCount = 0;
      let chunkError: string | null = null;
      try {
        const chunkAssignments = await this.cardMerchantOpenAi.classifyMerchantsChunk({
          categories: categoryPayload,
          merchants: chunk,
        });

        for (const assignment of chunkAssignments) {
          const entry = byKey.get(assignment.merchantKey);
          if (!entry) {
            errors.push(`Missing internal group for merchantKey "${assignment.merchantKey}"`);
            continue;
          }

          if (assignment.categoryId === null) {
            skippedMerchantCount++;
            chunkSkippedCount++;
            continue;
          }

          const ids = entry.ids;
          if (ids.length === 0) continue;

          const res = await this.prisma.transaction.updateMany({
            where: {
              userId,
              source: TransactionSource.CARD,
              categoryId: null,
              id: { in: ids },
            },
            data: { categoryId: assignment.categoryId, subcategoryId: assignment.subcategoryId ?? null },
          });

          updatedTransactionCount += res.count;
          assignedMerchantCount++;
          chunkAssignedCount++;

          await this.prisma.cardMerchantMemory.upsert({
            where: {
              userId_merchantKey: { userId, merchantKey: assignment.merchantKey },
            },
            create: {
              userId,
              merchantKey: assignment.merchantKey,
              categoryId: assignment.categoryId,
              subcategoryId: assignment.subcategoryId ?? null,
              hitCount: res.count,
              learnedSource: 'ai',
            },
            update: {
              categoryId: assignment.categoryId,
              subcategoryId: assignment.subcategoryId ?? null,
              hitCount: { increment: res.count },
              learnedSource: 'ai',
            },
          });
        }
      } catch (err) {
        // One bad chunk (e.g. the AI mis-pairing a category/subcategory) shouldn't fail the
        // whole run and discard merchants other chunks already classified correctly.
        chunkError = err instanceof Error ? err.message : 'Auto-categorize: chunk classification failed';
        errors.push(chunkError);
      }

      chunkLog.push({
        index: chunkIndex,
        merchantCount: chunk.length,
        assignedCount: chunkAssignedCount,
        skippedCount: chunkSkippedCount,
        error: chunkError,
      });

      if (runId) {
        await this.persistChunkProgress(runId, {
          scannedMerchantCount: processedMerchants,
          aiUpdatedCount: updatedTransactionCount,
          skippedCount: skippedMerchantCount,
          assignedMerchantCount,
          chunksCompleted: chunkIndex + 1,
          chunksTotal: totalChunks,
          chunks: chunkLog,
        });
      }
    }

    return {
      processedMerchants,
      assignedMerchantCount,
      skippedMerchantCount,
      updatedTransactionCount,
      errors,
      chunks: chunkLog,
    };
  }

  /** Best-effort write of running totals so a long AI run shows live progress, not just a final jump. */
  private async persistChunkProgress(
    runId: string,
    progress: {
      scannedMerchantCount: number;
      aiUpdatedCount: number;
      skippedCount: number;
      assignedMerchantCount: number;
      chunksCompleted: number;
      chunksTotal: number;
      chunks: ChunkLogEntry[];
    },
  ): Promise<void> {
    try {
      await this.prisma.cardCategorizationRun.update({
        where: { id: runId },
        data: {
          scannedMerchantCount: progress.scannedMerchantCount,
          aiUpdatedCount: progress.aiUpdatedCount,
          skippedCount: progress.skippedCount,
          meta: {
            aiAssignedMerchants: progress.assignedMerchantCount,
            aiSkippedMerchants: progress.skippedCount,
            chunksCompleted: progress.chunksCompleted,
            chunksTotal: progress.chunksTotal,
            chunks: progress.chunks,
          } as object,
        },
      });
    } catch (err) {
      this.logger.warn(
        `Failed to persist categorization progress for run ${runId}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  private async executeRun(runId: string): Promise<void> {
    const run = await this.prisma.cardCategorizationRun.findUnique({ where: { id: runId } });
    if (!run) return;

    const started = new Date();
    await this.prisma.cardCategorizationRun.update({
      where: { id: runId },
      data: {
        status: CategorizationRunStatus.RUNNING,
        startedAt: started,
        errorMessage: null,
      },
    });

    const userId = run.userId;
    let memoryMatched = 0;
    let aiUpdated = 0;
    let skipped = 0;
    const errors: string[] = [];

    try {
      memoryMatched = await this.applyMerchantMemoryMatches(userId);

      const aiResult = await this.classifyUncategorizedMerchantsWithAi(userId, run.id);
      aiUpdated = aiResult.updatedTransactionCount;
      skipped = aiResult.skippedMerchantCount;
      errors.push(...aiResult.errors);

      const stillLeft = await this.prisma.transaction.count({ where: this.uncategorizedEligibleWhere(userId) });
      const status =
        errors.length > 0
          ? CategorizationRunStatus.PARTIAL
          : stillLeft > 0
            ? CategorizationRunStatus.COMPLETED
            : CategorizationRunStatus.COMPLETED;

      await this.prisma.cardCategorizationRun.update({
        where: { id: runId },
        data: {
          status,
          finishedAt: new Date(),
          memoryMatchedCount: memoryMatched,
          aiUpdatedCount: aiUpdated,
          skippedCount: skipped,
          scannedMerchantCount: aiResult.processedMerchants,
          scannedTxCount: run.scannedTxCount,
          errorMessage:
            errors.length > 0 ? errors.slice(0, 15).join(' | ') : null,
          meta: {
            aiAssignedMerchants: aiResult.assignedMerchantCount,
            aiSkippedMerchants: aiResult.skippedMerchantCount,
            chunksCompleted: aiResult.chunks.length,
            chunksTotal: aiResult.chunks.length,
            chunks: aiResult.chunks,
          } as object,
        },
      });
    } catch (err) {
      await this.prisma.cardCategorizationRun.update({
        where: { id: runId },
        data: {
          status: CategorizationRunStatus.FAILED,
          finishedAt: new Date(),
          memoryMatchedCount: memoryMatched,
          aiUpdatedCount: aiUpdated,
          skippedCount: skipped,
          errorMessage: err instanceof Error ? err.message : 'Unknown error',
        },
      });
    }
  }
}
