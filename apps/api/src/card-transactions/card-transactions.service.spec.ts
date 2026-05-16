import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CardTxStatus, Prisma, TransactionSource } from '@crypto-tracker/db';
import { CategoriesService } from '../categories/categories.service';
import { TransactionsService } from '../transactions/transactions.service';
import { CardTransactionsService } from './card-transactions.service';

function makeTransactionStore() {
  const rows = new Map<string, Record<string, unknown>>();
  let nextId = 1;

  const findByExternal = (where: { userId: string; source: TransactionSource; externalId: string }) =>
    [...rows.values()].find(
      (row) => row.userId === where.userId && row.source === where.source && row.externalId === where.externalId,
    ) ?? null;

  return {
    rows,
    portfolioAccount: {
      updateMany: async () => ({ count: 0 }),
    },
    transaction: {
      findUnique: async (args: {
        where: {
          id?: string;
          userId_source_externalId?: { userId: string; source: TransactionSource; externalId: string };
        };
        select?: Record<string, boolean>;
      }) => {
        const row =
          args.where.id !== undefined
            ? rows.get(args.where.id) ?? null
            : args.where.userId_source_externalId
              ? findByExternal(args.where.userId_source_externalId)
              : null;
        if (!row || !args.select) return row;
        return Object.fromEntries(Object.keys(args.select).map((key) => [key, row[key]]));
      },
      upsert: async (args: {
        where: { userId_source_externalId: { userId: string; source: TransactionSource; externalId: string } };
        create: Record<string, unknown>;
        update: Record<string, unknown>;
      }) => {
        const existing = findByExternal(args.where.userId_source_externalId);
        if (existing) {
          Object.assign(existing, args.update);
          return existing;
        }

        const row = {
          id: `tx_${nextId++}`,
          ...args.create,
        };
        rows.set(row.id, row);
        return row;
      },
    },
  };
}

describe('CardTransactionsService', () => {
  it('upserts card rows into transactions and deduplicates repeated external ids in one sync', async () => {
    const prisma = makeTransactionStore();

    const service = new CardTransactionsService(prisma as never, {
      scheduleAfterSync: async () => {},
    } as never);

    const result = await service.sync('user_1', {
      parserVersion: 2,
      items: [
        {
          externalId: 'card_1',
          occurredAt: '2026-05-04T19:51:00.000Z',
          merchantName: 'Old merchant',
          fiatAmount: '-30.16',
          fiatCurrency: 'PLN',
          cryptoAmount: '-8.425460',
          cryptoSymbol: 'mUSD',
          status: 'SETTLED',
          parserVersion: 2,
          fundingSourceMasked: '0x4e******4d6f',
        },
        {
          externalId: 'card_1',
          occurredAt: '2026-05-04T19:51:00.000Z',
          merchantName: 'JMP S.A. BIEDRONKA 139',
          fiatAmount: '-30.16',
          fiatCurrency: 'PLN',
          cryptoAmount: '-8.425460',
          cryptoSymbol: 'mUSD',
          status: 'SETTLED',
          parserVersion: 2,
          fundingSourceMasked: '0x4e******4d6f',
        },
      ],
    });

    assert.deepEqual(result, { inserted: 1, updated: 0, skipped: 1 });
    assert.equal(prisma.rows.size, 1);

    const saved = [...prisma.rows.values()][0]!;
    assert.equal(saved.source, TransactionSource.CARD);
    assert.equal(saved.externalId, 'card_1');
    assert.equal(saved.merchantName, 'JMP S.A. BIEDRONKA 139');
    assert.deepEqual(saved.rawData, { cardScrape: { fundingSourceMasked: '0x4e******4d6f' } });
  });

  it('updates an existing card transaction by external id on later syncs', async () => {
    const prisma = makeTransactionStore();

    const service = new CardTransactionsService(prisma as never, {
      scheduleAfterSync: async () => {},
    } as never);

    const body = {
      parserVersion: 2,
      items: [
        {
          externalId: 'card_1',
          occurredAt: '2026-05-04T19:51:00.000Z',
          merchantName: 'Initial merchant',
          fiatAmount: '-30.16',
          fiatCurrency: 'PLN',
          cryptoAmount: '-8.425460',
          cryptoSymbol: 'mUSD',
          status: 'PENDING',
          parserVersion: 2,
          fundingSourceMasked: '0x4e******4d6f',
        },
      ],
    };

    assert.deepEqual(await service.sync('user_1', body), { inserted: 1, updated: 0, skipped: 0 });
    assert.deepEqual(
      await service.sync('user_1', {
        ...body,
        items: [{ ...body.items[0], merchantName: 'Updated merchant', status: 'SETTLED' }],
      }),
      { inserted: 0, updated: 1, skipped: 0 },
    );

    const saved = [...prisma.rows.values()][0]!;
    assert.equal(saved.merchantName, 'Updated merchant');
    assert.equal(saved.status, CardTxStatus.SETTLED);
  });
});

describe('CategoriesService', () => {
  it('returns only user-owned categories and creates missing defaults idempotently', async () => {
    const categories: Array<Record<string, unknown>> = [
      { id: 'system_1', userId: null, name: 'Transfer Out', isSystem: true },
      { id: 'user_1', userId: 'user_1', name: 'Groceries', isSystem: false },
    ];
    const prisma = {
      category: {
        findMany: async (args: { where?: { userId?: string; name?: { in: string[] } }; select?: Record<string, boolean> }) => {
          const names = args.where?.name?.in;
          if (names) {
            return categories
              .filter((category) => category.userId === args.where?.userId && names.includes(String(category.name)))
              .map((category) => (args.select ? { name: category.name } : category));
          }
          return categories.filter((category) => category.userId === args.where?.userId);
        },
        createMany: async (args: { data: Array<Record<string, unknown>> }) => {
          for (const item of args.data) {
            categories.push({ id: `cat_${categories.length + 1}`, isSystem: false, ...item });
          }
        },
      },
    };
    const service = new CategoriesService(prisma as never);

    assert.deepEqual(await service.findAll('user_1'), [
      { id: 'user_1', userId: 'user_1', name: 'Groceries', isSystem: false },
    ]);

    const withDefaults = await service.createDefaults('user_1');
    assert.equal(withDefaults.length, 25);
    assert.equal(categories.filter((category) => category.name === 'Groceries').length, 1);

    await service.createDefaults('user_1');
    assert.equal(categories.filter((category) => category.userId === 'user_1').length, 25);
  });
});

describe('TransactionsService (card)', () => {
  it('reports positive card spend in monthly stats when PLN is single fiat', async () => {
    const rows = [
      {
        source: TransactionSource.CARD,
        fiatCurrency: 'PLN',
        timestamp: new Date('2026-05-04T10:00:00.000Z'),
        fiatAmount: new Prisma.Decimal('-30.16'),
        status: CardTxStatus.SETTLED,
        categoryId: null as string | null,
      },
    ];

    const service = new TransactionsService({
      transaction: {
        findMany: async () => rows,
      },
      category: { findMany: async () => [] },
      cardMerchantMemory: {
        upsert: async () => {},
        deleteMany: async () => ({ count: 0 }),
      },
    } as never);

    const stats = await service.stats('user_1', { year: 2026 });

    assert.equal(stats.displayCurrency, 'PLN');
    assert.equal(stats.totalSpent, 30.16);
    assert.equal(stats.monthly[4]!.spent, 30.16);
  });

  it('groups card merchants and updates all matching rows + merchant memory', async () => {
    const rows: Array<{
      id: string;
      userId: string;
      source: TransactionSource;
      merchantName: string;
      fiatAmount?: Prisma.Decimal;
      fiatCurrency?: string;
      categoryId: string | null;
      timestamp?: Date;
      status?: CardTxStatus;
    }> = [
      {
        id: 'tx_1',
        userId: 'user_1',
        source: TransactionSource.CARD,
        merchantName: 'JMP S.A. BIEDRONKA 139',
        fiatAmount: new Prisma.Decimal('-30.16'),
        fiatCurrency: 'PLN',
        categoryId: null,
        timestamp: new Date('2026-05-04T10:00:00.000Z'),
        status: CardTxStatus.SETTLED,
      },
      {
        id: 'tx_2',
        userId: 'user_1',
        source: TransactionSource.CARD,
        merchantName: 'jmp s a biedronka 139',
        fiatAmount: new Prisma.Decimal('-10.00'),
        fiatCurrency: 'PLN',
        categoryId: null,
        timestamp: new Date('2026-05-05T10:00:00.000Z'),
        status: CardTxStatus.SETTLED,
      },
      {
        id: 'other_user_tx',
        userId: 'user_2',
        source: TransactionSource.CARD,
        merchantName: 'JMP S.A. BIEDRONKA 139',
        categoryId: null,
        status: CardTxStatus.SETTLED,
      },
    ];

    let memoryUpserts = 0;

    const prisma = {
      transaction: {
        findMany: async () => rows.filter((row) => row.userId === 'user_1'),
        updateMany: async (args: { where: { id: { in: string[] } }; data: { categoryId: string | null } }) => {
          for (const row of rows) {
            if (args.where.id.in.includes(row.id)) row.categoryId = args.data.categoryId;
          }
          return { count: args.where.id.in.length };
        },
      },
      category: {
        findMany: async () => [{ id: 'cat_1', name: 'Groceries', color: '#22c55e' }],
        findFirst: async () => ({ id: 'cat_1' }),
      },
      cardMerchantMemory: {
        upsert: async () => {
          memoryUpserts += 1;
        },
        deleteMany: async () => ({ count: 0 }),
      },
    };

    const service = new TransactionsService(prisma as never);

    const merchants = await service.cardMerchants('user_1');
    assert.equal(merchants.length, 1);
    assert.equal(merchants[0]!.key, 'jmp s a biedronka 139');
    assert.equal(merchants[0]!.count, 2);
    assert.equal(merchants[0]!.totalFiatSpend, 40.16);

    assert.deepEqual(await service.updateCardMerchantCategory('user_1', 'jmp s a biedronka 139', { categoryId: 'cat_1' }), {
      key: 'jmp s a biedronka 139',
      categoryId: 'cat_1',
      updatedCount: 2,
    });
    assert.equal(rows[0]!.categoryId, 'cat_1');
    assert.equal(rows[1]!.categoryId, 'cat_1');
    assert.equal(rows[2]!.categoryId, null);
    assert.equal(memoryUpserts, 1);

    assert.deepEqual(await service.updateCardMerchantCategory('user_1', 'jmp s a biedronka 139', { categoryId: null }), {
      key: 'jmp s a biedronka 139',
      categoryId: null,
      updatedCount: 2,
    });
    assert.equal(rows[0]!.categoryId, null);
    assert.equal(rows[1]!.categoryId, null);
  });
});
