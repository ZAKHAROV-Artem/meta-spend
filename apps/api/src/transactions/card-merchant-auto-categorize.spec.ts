import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { TransactionSource } from '@metaspend/db';
import {
  parseAutoCategorizeAiPayload,
  stripJsonFence,
  validateAssignmentsForChunk,
} from './card-merchant-auto-categorize.schema';
import { CardCategorizationRunService } from '../card-transactions/card-categorization-run.service';

describe('cardMerchantAutoCategorize schema helpers', () => {
  it('stripJsonFence removes markdown fences', () => {
    const inner = '{"assignments":[{"merchantKey":"m","categoryId":"c1","subcategoryId":null}]}';
    assert.equal(stripJsonFence('```json\n' + inner + '\n```'), inner);
    assert.equal(stripJsonFence('```\n' + inner + '\n```'), inner);
    assert.equal(stripJsonFence('  ' + inner + '  '), inner);
  });

  it('parseAutoCategorizeAiPayload parses valid payloads', () => {
    const data = parseAutoCategorizeAiPayload(
      JSON.stringify({
        assignments: [
          { merchantKey: 'coffee shop', categoryId: 'cid_abc', subcategoryId: null, confidence: 0.9 },
          { merchantKey: 'metro', categoryId: null, subcategoryId: null },
        ],
      }),
    );
    assert.equal(data.assignments.length, 2);
    assert.equal(data.assignments[0]!.merchantKey, 'coffee shop');
    assert.equal(data.assignments[1]!.categoryId, null);
  });

  it('reject extra top-level keys (strict)', () => {
    assert.throws(() => {
      parseAutoCategorizeAiPayload(
        JSON.stringify({
          assignments: [{ merchantKey: 'x', categoryId: null, subcategoryId: null }],
          stray: true,
        }),
      );
    });
  });

  it('validateAssignmentsForChunk enforces full coverage', () => {
    const expectedKeys = new Set(['a', 'b']);
    const categoryIds = new Set(['cat1']);
    const subcategoryIds = new Set(['sub1']);
    const subcategoryParentMap = new Map([['sub1', 'cat1']]);

    assert.throws(() => {
      validateAssignmentsForChunk({
        assignments: [{ merchantKey: 'a', categoryId: 'cat1', subcategoryId: null }],
        expectedKeys,
        categoryIds,
        subcategoryIds,
        subcategoryParentMap,
      });
    });

    validateAssignmentsForChunk({
      assignments: [
        { merchantKey: 'a', categoryId: 'cat1', subcategoryId: 'sub1' },
        { merchantKey: 'b', categoryId: null, subcategoryId: null },
      ],
      expectedKeys,
      categoryIds,
      subcategoryIds,
      subcategoryParentMap,
    });
  });

  it('downgrades a subcategory that belongs to a different (but valid) category instead of throwing', () => {
    const expectedKeys = new Set(['a']);
    const categoryIds = new Set(['cat_travel', 'cat_shopping']);
    const subcategoryIds = new Set(['sub_beauty']);
    const subcategoryParentMap = new Map([['sub_beauty', 'cat_shopping']]);

    const row = { merchantKey: 'a', categoryId: 'cat_travel', subcategoryId: 'sub_beauty' };

    const warnings = validateAssignmentsForChunk({
      assignments: [row],
      expectedKeys,
      categoryIds,
      subcategoryIds,
      subcategoryParentMap,
    });

    assert.equal(row.subcategoryId, null);
    assert.equal(warnings.length, 1);
    assert.match(warnings[0]!, /sub_beauty/);
    assert.match(warnings[0]!, /cat_travel/);
  });

  it('downgrades an entirely unknown categoryId instead of throwing', () => {
    const expectedKeys = new Set(['a']);
    const categoryIds = new Set(['cat_real']);
    const subcategoryIds = new Set<string>();
    const subcategoryParentMap = new Map<string, string>();

    const row = { merchantKey: 'a', categoryId: 'cat_hallucinated', subcategoryId: null };

    const warnings = validateAssignmentsForChunk({
      assignments: [row],
      expectedKeys,
      categoryIds,
      subcategoryIds,
      subcategoryParentMap,
    });

    assert.equal(row.categoryId, null);
    assert.equal(row.subcategoryId, null);
    assert.equal(warnings.length, 1);
    assert.match(warnings[0]!, /cat_hallucinated/);
  });

  it('downgrades an entirely unknown subcategoryId instead of throwing, keeping a valid categoryId', () => {
    const expectedKeys = new Set(['a']);
    const categoryIds = new Set(['cat_real']);
    const subcategoryIds = new Set(['sub_real']);
    const subcategoryParentMap = new Map([['sub_real', 'cat_real']]);

    const row = { merchantKey: 'a', categoryId: 'cat_real', subcategoryId: 'sub_hallucinated' };

    const warnings = validateAssignmentsForChunk({
      assignments: [row],
      expectedKeys,
      categoryIds,
      subcategoryIds,
      subcategoryParentMap,
    });

    assert.equal(row.categoryId, 'cat_real');
    assert.equal(row.subcategoryId, null);
    assert.equal(warnings.length, 1);
    assert.match(warnings[0]!, /sub_hallucinated/);
  });
});

describe('CardCategorizationRunService AI assignment', () => {
  it('writes category + merchant memory when AI assigns non-null ids', async () => {
    const rows = [
      {
        id: 'tx_1',
        userId: 'user_1',
        source: TransactionSource.CARD,
        merchantName: 'STARBUCKS 123',
        categoryId: null as string | null,
      },
    ];

    let updateManyCalls = 0;

    const prisma = {
      category: {
        findMany: async () => [{ id: 'cat_food', name: 'Food', subCategories: [] }],
      },
      transaction: {
        findMany: async () =>
          rows
            .filter(
              (r) =>
                r.userId === 'user_1' &&
                r.source === TransactionSource.CARD &&
                r.merchantName !== null &&
                r.categoryId === null,
            )
            .map(({ id, merchantName }) => ({ id, merchantName })),
        updateMany: async () => {
          updateManyCalls += 1;
          for (const r of rows) {
            r.categoryId = 'cat_food';
          }
          return { count: 1 };
        },
      },
      cardMerchantMemory: {
        upsert: async () => {},
      },
    };

    const openAi = {
      classifyMerchantsChunk: async () => [{ merchantKey: 'starbucks 123', categoryId: 'cat_food', subcategoryId: null }],
    };

    const service = new CardCategorizationRunService(prisma as never, openAi as never);

    const result = await service.classifyUncategorizedMerchantsWithAi('user_1');

    assert.equal(updateManyCalls, 1);
    assert.equal(result.processedMerchants, 1);
    assert.equal(result.assignedMerchantCount, 1);
    assert.equal(result.updatedTransactionCount, 1);
    assert.equal(result.skippedMerchantCount, 0);
    assert.deepEqual(result.errors, []);
  });

  it('records a per-chunk failure instead of throwing, so other chunks still complete', async () => {
    const rows = [
      {
        id: 'tx_1',
        userId: 'user_1',
        source: TransactionSource.CARD,
        merchantName: 'WEIRD MERCHANT',
        categoryId: null as string | null,
      },
    ];

    const prisma = {
      category: {
        findMany: async () => [{ id: 'cat_food', name: 'Food', subCategories: [] }],
      },
      transaction: {
        findMany: async () => rows.map(({ id, merchantName }) => ({ id, merchantName })),
        updateMany: async () => {
          throw new Error('should not be called for a failed chunk');
        },
      },
      cardMerchantMemory: {
        upsert: async () => {
          throw new Error('should not be called for a failed chunk');
        },
      },
    };

    const openAi = {
      classifyMerchantsChunk: async () => {
        throw new Error(
          'Auto-categorize: subcategoryId "sub_beauty" does not belong to categoryId "cat_travel"',
        );
      },
    };

    const service = new CardCategorizationRunService(prisma as never, openAi as never);

    const result = await service.classifyUncategorizedMerchantsWithAi('user_1');

    assert.equal(result.processedMerchants, 1);
    assert.equal(result.assignedMerchantCount, 0);
    assert.equal(result.updatedTransactionCount, 0);
    assert.equal(result.errors.length, 1);
    assert.match(result.errors[0]!, /does not belong to categoryId/);
  });

  it('persists cumulative progress to the run row after each chunk, not just at the end', async () => {
    const MERCHANT_COUNT = 41; // > CHUNK (40), forces two chunks
    const rows = Array.from({ length: MERCHANT_COUNT }, (_, i) => ({
      id: `tx_${i}`,
      userId: 'user_1',
      source: TransactionSource.CARD,
      merchantName: `MERCHANT ${i}`,
      categoryId: null as string | null,
    }));

    const runUpdates: Array<{ where: { id: string }; data: Record<string, unknown> }> = [];

    const prisma = {
      category: {
        findMany: async () => [{ id: 'cat_food', name: 'Food', subCategories: [] }],
      },
      transaction: {
        findMany: async () => rows.map(({ id, merchantName }) => ({ id, merchantName })),
        updateMany: async () => ({ count: 1 }),
      },
      cardMerchantMemory: {
        upsert: async () => {},
      },
      cardCategorizationRun: {
        update: async (args: { where: { id: string }; data: Record<string, unknown> }) => {
          runUpdates.push(args);
          return {};
        },
      },
    };

    const openAi = {
      classifyMerchantsChunk: async (input: { merchants: Array<{ merchantKey: string }> }) =>
        input.merchants.map((m) => ({ merchantKey: m.merchantKey, categoryId: 'cat_food', subcategoryId: null })),
    };

    const service = new CardCategorizationRunService(prisma as never, openAi as never);

    const result = await service.classifyUncategorizedMerchantsWithAi('user_1', 'run_1');

    assert.equal(runUpdates.length, 2, 'expected one progress write per chunk');
    assert.equal(runUpdates[0]!.where.id, 'run_1');
    assert.equal(runUpdates[0]!.data.aiUpdatedCount, 40);
    assert.deepEqual(
      (runUpdates[0]!.data.meta as { chunksCompleted: number; chunksTotal: number }).chunksCompleted,
      1,
    );
    assert.equal(
      (runUpdates[0]!.data.meta as { chunksCompleted: number; chunksTotal: number }).chunksTotal,
      2,
    );
    assert.equal(runUpdates[1]!.data.aiUpdatedCount, 41);
    assert.equal(
      (runUpdates[1]!.data.meta as { chunksCompleted: number; chunksTotal: number }).chunksCompleted,
      2,
    );

    assert.equal(result.processedMerchants, MERCHANT_COUNT);
    assert.equal(result.assignedMerchantCount, MERCHANT_COUNT);
    assert.equal(result.updatedTransactionCount, MERCHANT_COUNT);
    assert.equal(result.skippedMerchantCount, 0);
    assert.deepEqual(result.errors, []);
  });

  it('records a per-chunk breakdown in meta.chunks, including a failed chunk', async () => {
    const MERCHANT_COUNT = 41; // > CHUNK (40), forces two chunks
    const rows = Array.from({ length: MERCHANT_COUNT }, (_, i) => ({
      id: `tx_${i}`,
      userId: 'user_1',
      source: TransactionSource.CARD,
      merchantName: `MERCHANT ${i}`,
      categoryId: null as string | null,
    }));

    const runUpdates: Array<{ where: { id: string }; data: Record<string, unknown> }> = [];

    const prisma = {
      category: {
        findMany: async () => [{ id: 'cat_food', name: 'Food', subCategories: [] }],
      },
      transaction: {
        findMany: async () => rows.map(({ id, merchantName }) => ({ id, merchantName })),
        updateMany: async () => ({ count: 1 }),
      },
      cardMerchantMemory: {
        upsert: async () => {},
      },
      cardCategorizationRun: {
        update: async (args: { where: { id: string }; data: Record<string, unknown> }) => {
          runUpdates.push(args);
          return {};
        },
      },
    };

    let chunkCalls = 0;
    const openAi = {
      classifyMerchantsChunk: async (input: { merchants: Array<{ merchantKey: string }> }) => {
        chunkCalls++;
        if (chunkCalls === 2) {
          throw new Error('Auto-categorize: AI provider request failed');
        }
        return input.merchants.map((m) => ({ merchantKey: m.merchantKey, categoryId: 'cat_food', subcategoryId: null }));
      },
    };

    const service = new CardCategorizationRunService(prisma as never, openAi as never);

    const result = await service.classifyUncategorizedMerchantsWithAi('user_1', 'run_1');

    type ChunkLogEntry = {
      index: number;
      merchantCount: number;
      assignedCount: number;
      skippedCount: number;
      error: string | null;
    };

    assert.equal(runUpdates.length, 2);
    const finalChunks = (runUpdates[1]!.data.meta as { chunks: ChunkLogEntry[] }).chunks;
    assert.equal(finalChunks.length, 2);
    assert.deepEqual(finalChunks[0], {
      index: 0,
      merchantCount: 40,
      assignedCount: 40,
      skippedCount: 0,
      error: null,
    });
    assert.equal(finalChunks[1]!.index, 1);
    assert.equal(finalChunks[1]!.merchantCount, 1);
    assert.equal(finalChunks[1]!.assignedCount, 0);
    assert.equal(finalChunks[1]!.skippedCount, 0);
    assert.match(finalChunks[1]!.error ?? '', /AI provider request failed/);

    assert.deepEqual(result.chunks, finalChunks);
    assert.equal(result.errors.length, 1);
  });

  it('returns zeros when nothing to categorize', async () => {
    const prisma = {
      category: {
        findMany: async () => [{ id: 'cat_food', name: 'Food', subCategories: [] }],
      },
      transaction: {
        findMany: async () => [] as { id: string; merchantName: string }[],
      },
    };

    let calls = 0;
    const openAi = {
      classifyMerchantsChunk: async () => {
        calls += 1;
        return [];
      },
    };

    const service = new CardCategorizationRunService(prisma as never, openAi as never);

    const result = await service.classifyUncategorizedMerchantsWithAi('user_1');

    assert.equal(calls, 0);
    assert.deepEqual(result, {
      processedMerchants: 0,
      assignedMerchantCount: 0,
      skippedMerchantCount: 0,
      updatedTransactionCount: 0,
      chunks: [],
      errors: [],
    });
  });
});
