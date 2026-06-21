import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CardTxStatus, TransactionSource } from '@metaspend/db';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TripsService } from './trips.service';

function makeTx(id: string, occurredAt: string, currency: string, amount: string) {
  return {
    id,
    userId: 'user_1',
    source: TransactionSource.CARD,
    externalId: id,
    timestamp: new Date(occurredAt),
    merchantName: id.toUpperCase(),
    merchantRaw: null,
    fiatAmount: { toString: () => amount },
    fiatCurrency: currency,
    cryptoAmount: null,
    cryptoSymbol: null,
    status: CardTxStatus.SETTLED,
    parserVersion: 2,
    rawHtml: null,
    rawData: null,
    categoryId: null,
    subcategoryId: null,
    notes: null,
    createdAt: new Date(occurredAt),
    updatedAt: new Date(occurredAt),
    category: null,
    subcategory: null,
  };
}

function makeTripsPrisma(seedRows: ReturnType<typeof makeTx>[]) {
  const transactions = [...seedRows];
  const trips: Array<Record<string, unknown>> = [];
  let nextTrip = 1;

  const transactionMatches = (tx: ReturnType<typeof makeTx>, where: Record<string, unknown>) => {
    if (where.userId && tx.userId !== where.userId) return false;
    if (where.source && tx.source !== where.source) return false;
    const idFilter = where.id as { in?: string[] } | undefined;
    if (idFilter?.in && !idFilter.in.includes(tx.id)) return false;
    const timestamp = where.timestamp as { gte?: Date; lte?: Date } | undefined;
    if (timestamp?.gte && tx.timestamp < timestamp.gte) return false;
    if (timestamp?.lte && tx.timestamp > timestamp.lte) return false;
    return true;
  };

  const prisma: any = {
    transaction: {
      findMany: async (args: { where: Record<string, unknown>; orderBy?: Record<string, unknown> }) => {
        const rows = transactions.filter((tx) => transactionMatches(tx, args.where));
        if (args.orderBy) {
          return rows.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        }
        return rows;
      },
    },
    trip: {
      create: async (args: { data: Record<string, unknown> }) => {
        const transactionIds = ((args.data.transactions as { create: Array<{ transactionId: string }> }).create).map(
          (item) => item.transactionId,
        );
        const row = {
          id: `trip_${nextTrip++}`,
          createdAt: new Date('2026-06-06T00:00:00.000Z'),
          updatedAt: new Date('2026-06-06T00:00:00.000Z'),
          ...args.data,
          transactions: transactionIds.map((transactionId) => ({
            tripId: `trip_${nextTrip - 1}`,
            transactionId,
            transaction: transactions.find((tx) => tx.id === transactionId)!,
          })),
        };
        trips.push(row);
        return row;
      },
      findFirst: async (args: { where: { id: string; userId: string } }) =>
        trips.find((trip) => trip.id === args.where.id && trip.userId === args.where.userId) ?? null,
      update: async (args: { where: { id: string }; data: Record<string, unknown> }) => {
        const row = trips.find((trip) => trip.id === args.where.id);
        assert.ok(row);
        Object.assign(row, args.data);
        return row;
      },
    },
    $transaction: async <T>(fn: (client: any) => Promise<T>) => fn(prisma),
  };

  return { prisma, trips };
}

describe('TripsService', () => {
  it('previews every transaction between the selected first and last transaction timestamps', async () => {
    const { prisma } = makeTripsPrisma([
      makeTx('june_1', '2026-06-01T09:00:00.000Z', 'EUR', '-10.00'),
      makeTx('june_2', '2026-06-02T12:00:00.000Z', 'EUR', '-20.00'),
      makeTx('june_5', '2026-06-05T21:00:00.000Z', 'EUR', '-30.00'),
    ]);
    const service = new TripsService(prisma as never, { getRates: async () => ({ EUR: 1 }) } as never);

    const preview = await service.preview('user_1', {
      startTransactionId: 'june_1',
      endTransactionId: 'june_5',
    });

    assert.equal(preview.transactionCount, 3);
    assert.deepEqual(preview.transactions.map((tx) => tx.id), ['june_1', 'june_2', 'june_5']);
    assert.deepEqual(preview.automaticTransactionIds, ['june_1', 'june_2', 'june_5']);
    assert.equal(preview.currency, 'EUR');
    assert.equal(preview.totalsByCurrency[0]?.totalSpent, 60);
  });

  it('creates a trip with extras outside the anchor range without changing trip dates', async () => {
    const { prisma } = makeTripsPrisma([
      makeTx('fuel_repay', '2026-05-30T09:00:00.000Z', 'EUR', '30.00'),
      makeTx('june_1', '2026-06-01T09:00:00.000Z', 'EUR', '-10.00'),
      makeTx('june_2', '2026-06-02T12:00:00.000Z', 'EUR', '-20.00'),
      makeTx('june_5', '2026-06-05T21:00:00.000Z', 'EUR', '-30.00'),
    ]);
    const service = new TripsService(prisma as never, { getRates: async () => ({ EUR: 1 }) } as never);

    const trip = await service.create('user_1', {
      name: 'Rhodes',
      startTransactionId: 'june_1',
      endTransactionId: 'june_5',
      includeTransactionIds: ['fuel_repay'],
    });

    assert.equal(trip.transactionCount, 4);
    assert.equal(trip.startAt, '2026-06-01T09:00:00.000Z');
    assert.equal(trip.endAt, '2026-06-05T21:00:00.000Z');
    assert.equal(trip.totalsByCurrency[0]?.totalSpent, 60);
    assert.equal(trip.totalsByCurrency[0]?.totalReceived, 30);
  });

  it('excludes an in-range transaction from the final trip links', async () => {
    const { prisma } = makeTripsPrisma([
      makeTx('june_1', '2026-06-01T09:00:00.000Z', 'EUR', '-10.00'),
      makeTx('june_2', '2026-06-02T12:00:00.000Z', 'EUR', '-20.00'),
      makeTx('june_5', '2026-06-05T21:00:00.000Z', 'EUR', '-30.00'),
    ]);
    const service = new TripsService(prisma as never, { getRates: async () => ({ EUR: 1 }) } as never);

    const trip = await service.create('user_1', {
      name: 'Rhodes',
      startTransactionId: 'june_1',
      endTransactionId: 'june_5',
      excludeTransactionIds: ['june_2'],
    });

    assert.equal(trip.transactionCount, 2);
    assert.equal(trip.totalsByCurrency[0]?.totalSpent, 40);
  });

  it('auto-picks dominant trip currency and allows currency updates', async () => {
    const { prisma } = makeTripsPrisma([
      makeTx('a', '2026-06-01T09:00:00.000Z', 'EUR', '-100.00'),
      makeTx('b', '2026-06-02T12:00:00.000Z', 'PLN', '-20.00'),
      makeTx('c', '2026-06-03T12:00:00.000Z', 'PLN', '-30.00'),
    ]);
    const service = new TripsService(prisma as never, { getRates: async () => ({ EUR: 1, PLN: 4, USD: 1 }) } as never);

    const created = await service.create('user_1', {
      name: 'Mixed',
      startTransactionId: 'a',
      endTransactionId: 'c',
    });
    assert.equal(created.currency, 'PLN');

    const updated = await service.update('user_1', created.id, { currency: 'usd' });
    assert.equal(updated.currency, 'USD');
  });

  it('returns clear errors for incomplete or missing range anchors', async () => {
    const { prisma } = makeTripsPrisma([
      makeTx('a', '2026-06-01T09:00:00.000Z', 'EUR', '-10.00'),
      makeTx('b', '2026-06-02T09:00:00.000Z', 'EUR', '-10.00'),
    ]);
    const service = new TripsService(prisma as never, { getRates: async () => ({ EUR: 1 }) } as never);

    await assert.rejects(
      () => service.preview('user_1', { startTransactionId: 'a' }),
      BadRequestException,
    );
    await assert.rejects(
      () => service.preview('user_1', { startTransactionId: 'a', endTransactionId: 'missing' }),
      NotFoundException,
    );
    await assert.rejects(
      () => service.preview('user_1', { startTransactionId: 'a', endTransactionId: 'a' }),
      BadRequestException,
    );
  });
});
