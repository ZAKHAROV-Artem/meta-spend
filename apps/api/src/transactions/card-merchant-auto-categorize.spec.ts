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

    assert.throws(() => {
      validateAssignmentsForChunk({
        assignments: [
          { merchantKey: 'a', categoryId: 'cat1', subcategoryId: null },
          { merchantKey: 'b', categoryId: 'bogus', subcategoryId: null },
        ],
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
      errors: [],
    });
  });
});
