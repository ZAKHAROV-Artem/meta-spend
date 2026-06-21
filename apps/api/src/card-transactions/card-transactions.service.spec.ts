import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CardTxStatus, Prisma, TransactionSource } from '@metaspend/db';
import { ConflictException } from '@nestjs/common';
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
      findMany: async (args: {
        where?: { userId?: string; source?: TransactionSource; externalId?: { in: string[] } };
        select?: Record<string, boolean>;
      }) => {
        const externalIds = args.where?.externalId?.in;
        return [...rows.values()]
          .filter((row) => {
            if (args.where?.userId && row.userId !== args.where.userId) return false;
            if (args.where?.source && row.source !== args.where.source) return false;
            if (externalIds && !externalIds.includes(String(row.externalId))) return false;
            return true;
          })
          .map((row) => (args.select ? Object.fromEntries(Object.keys(args.select).map((key) => [key, row[key]])) : row));
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

  it('syncs MetaMask credited rows as positive native inflows with credit metadata', async () => {
    const parsed = {
      externalId: 'cee6337e-924a-4f1a-94fc-b4d95660d6ea',
      occurredAt: '2026-06-04T19:30:00.000Z',
      merchantName: 'CENTAURO RHODES',
      fiatAmount: '81.165453',
      fiatCurrency: 'USDC',
      cryptoAmount: '81.165453',
      cryptoSymbol: 'USDC',
      status: 'SETTLED',
      parserVersion: 2,
      creditedRaw: '+81.165453 USDC',
      creditDestinationMasked: 'Credit Wallet',
    };

    const prisma = makeTransactionStore();
    const service = new CardTransactionsService(prisma as never, {
      scheduleAfterSync: async () => {},
    } as never);

    assert.deepEqual(
      await service.sync('user_1', {
        parserVersion: 2,
        items: [parsed],
      }),
      { inserted: 1, updated: 0, skipped: 0 },
    );

    const saved = [...prisma.rows.values()][0]!;
    assert.equal(String(saved.fiatAmount), '81.165453');
    assert.equal(saved.fiatCurrency, 'USDC');
    assert.deepEqual(saved.rawData, {
      cardScrape: {
        creditedRaw: '+81.165453 USDC',
        creditDestinationMasked: 'Credit Wallet',
      },
    });
  });
});

describe('CategoriesService', () => {
  function makeCategoryPrisma(seed: Array<Record<string, unknown>> = []) {
    const categories: Array<Record<string, unknown>> = [...seed];
    let nextId = 1;

    const matchesWhere = (category: Record<string, unknown>, where?: Record<string, unknown>) => {
      if (!where) return true;
      if ('userId' in where && category.userId !== where.userId) return false;
      if ('parentId' in where && category.parentId !== where.parentId) return false;
      if ('id' in where) {
        const id = where.id as string | { not?: string };
        if (typeof id === 'string' && category.id !== id) return false;
        if (typeof id === 'object' && id.not && category.id === id.not) return false;
      }
      if ('name' in where) {
        const name = where.name as string | { in?: string[] };
        if (typeof name === 'string' && category.name !== name) return false;
        if (typeof name === 'object' && name.in && !name.in.includes(String(category.name))) return false;
      }
      return true;
    };

    const applySelect = (category: Record<string, unknown>, select?: Record<string, boolean>) => {
      if (!select) return category;
      return Object.fromEntries(Object.keys(select).map((key) => [key, category[key]]));
    };

    const prisma = {
      category: {
        findMany: async (args: {
          where?: Record<string, unknown>;
          select?: Record<string, boolean>;
          include?: { subCategories?: boolean | Record<string, unknown> };
        } = {}) => {
          return categories.filter((category) => matchesWhere(category, args.where)).map((category) => {
            if (args.include?.subCategories) {
              return {
                ...category,
                subCategories: categories.filter((sub) => sub.parentId === category.id),
              };
            }
            return applySelect(category, args.select);
          });
        },
        findFirst: async (args: { where?: Record<string, unknown> }) =>
          categories.find((category) => matchesWhere(category, args.where)) ?? null,
        findUnique: async (args: { where: { id: string } }) =>
          categories.find((category) => category.id === args.where.id) ?? null,
        create: async (args: { data: Record<string, unknown> }) => {
          const row = {
            id: `cat_${nextId++}`,
            isSystem: false,
            parentId: null,
            ...args.data,
          };
          categories.push(row);
          return row;
        },
        createMany: async (args: { data: Array<Record<string, unknown>> }) => {
          for (const item of args.data) {
            categories.push({ id: `cat_${nextId++}`, isSystem: false, parentId: null, ...item });
          }
        },
        update: async (args: { where: { id: string }; data: Record<string, unknown> }) => {
          const row = categories.find((category) => category.id === args.where.id);
          assert.ok(row);
          Object.assign(row, args.data);
          return row;
        },
      },
    };
    return { prisma, categories };
  }

  it('returns only user-owned categories and creates fresh defaults with subcategories idempotently', async () => {
    const { prisma, categories } = makeCategoryPrisma([
      { id: 'system_1', userId: null, name: 'Transfer Out', isSystem: true, parentId: null },
      { id: 'user_1', userId: 'user_1', name: 'Groceries', isSystem: false, parentId: null },
    ]);
    const service = new CategoriesService(prisma as never);

    assert.deepEqual(await service.findAll('user_1'), [
      { id: 'user_1', userId: 'user_1', name: 'Groceries', isSystem: false, parentId: null, subCategories: [] },
    ]);

    const withDefaults = await service.seedDefaults('user_1');
    assert.equal(withDefaults.length, 10);
    assert.equal(categories.filter((category) => category.name === 'Groceries').length, 1);
    assert.ok(categories.some((category) => category.name === 'Fuel & charging' && category.parentId));
    assert.ok(categories.some((category) => category.name === 'Restaurants' && category.parentId));

    const countAfterFirstRun = categories.filter((category) => category.userId === 'user_1').length;
    await service.seedDefaults('user_1');
    assert.equal(categories.filter((category) => category.userId === 'user_1').length, countAfterFirstRun);
  });

  it('adds default subcategories only to matching existing parent categories', async () => {
    const { prisma, categories } = makeCategoryPrisma([
      { id: 'transport', userId: 'user_1', name: 'Transport', color: '#3b82f6', icon: 'car', isSystem: false, parentId: null },
      { id: 'custom', userId: 'user_1', name: 'Custom', color: '#111111', icon: 'tag', isSystem: false, parentId: null },
    ]);
    const service = new CategoriesService(prisma as never);

    await service.seedDefaultSubcategories('user_1');

    assert.ok(categories.some((category) => category.name === 'Taxi & rideshare' && category.parentId === 'transport'));
    assert.equal(categories.some((category) => category.name === 'Groceries'), false);
    const countAfterFirstRun = categories.length;
    await service.seedDefaultSubcategories('user_1');
    assert.equal(categories.length, countAfterFirstRun);
  });

  it('rejects duplicate names only among sibling categories', async () => {
    const { prisma } = makeCategoryPrisma([
      { id: 'transport', userId: 'user_1', name: 'Transport', color: '#3b82f6', icon: 'car', isSystem: false, parentId: null },
      { id: 'shopping', userId: 'user_1', name: 'Shopping', color: '#ec4899', icon: 'shopping-bag', isSystem: false, parentId: null },
      { id: 'parking', userId: 'user_1', name: 'Parking', color: '#60a5fa', icon: 'square-parking', isSystem: false, parentId: 'transport' },
    ]);
    const service = new CategoriesService(prisma as never);

    await service.create('user_1', { name: 'Parking', color: '#ec4899', icon: 'square-parking', parentId: 'shopping' });
    await assert.rejects(
      service.create('user_1', { name: 'Parking', color: '#60a5fa', icon: 'square-parking', parentId: 'transport' }),
      ConflictException,
    );
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
    } as never, { getRates: async () => ({ PLN: 1 }) } as never);

    const stats = await service.stats('user_1', { year: 2026 });

    assert.equal(stats.displayCurrency, 'PLN');
    assert.equal(stats.totalSpent, 30.16);
    assert.equal(stats.monthly[4]!.spent, 30.16);
  });

  it('filters transactions and stats by parent categories and subcategories independently', async () => {
    const capturedWhere: unknown[] = [];
    const prisma = {
      transaction: {
        findMany: async (args: { where: unknown }) => {
          capturedWhere.push(args.where);
          return [];
        },
        count: async (args: { where: unknown }) => {
          capturedWhere.push(args.where);
          return 0;
        },
      },
      category: { findMany: async () => [] },
    };
    const service = new TransactionsService(prisma as never, { getRates: async () => ({}) } as never);

    await service.list('user_1', {
      categoryId: 'cat_transport,cat_travel',
      subcategoryId: 'sub_fuel',
      page: 1,
      limit: 20,
    });
    await service.stats('user_1', {
      categoryId: 'cat_transport',
      subcategoryId: 'sub_fuel,sub_parking',
      year: 2026,
    });

    assert.deepEqual(capturedWhere[0], {
      userId: 'user_1',
      source: TransactionSource.CARD,
      AND: [
        {
          OR: [
            { categoryId: { in: ['cat_transport', 'cat_travel'] } },
            { subcategoryId: 'sub_fuel' },
          ],
        },
      ],
    });
    assert.deepEqual(capturedWhere[2], {
      userId: 'user_1',
      source: TransactionSource.CARD,
      AND: [
        {
          OR: [
            { categoryId: 'cat_transport' },
            { subcategoryId: { in: ['sub_fuel', 'sub_parking'] } },
          ],
        },
      ],
    });
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

    const service = new TransactionsService(prisma as never, { getRates: async () => ({}) } as never);

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
