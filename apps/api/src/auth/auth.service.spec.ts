import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { SiweMessage } from 'siwe';
import { AuthService } from './auth.service';
import { NonceStore } from './siwe/nonce.store';

function makeUsersServiceFake() {
  const usersById = new Map<
    string,
    { id: string; email: string; passwordHash: string | null; defaultCurrency: string | null }
  >();
  let nextId = 1;
  return {
    usersById,
    findByEmail: async (email: string) => [...usersById.values()].find((u) => u.email === email) ?? null,
    findById: async (id: string) => usersById.get(id) ?? null,
    create: async (data: { email: string; passwordHash?: string | null }) => {
      const user = { id: `user_${nextId++}`, email: data.email, passwordHash: data.passwordHash ?? null, defaultCurrency: null };
      usersById.set(user.id, user);
      return user;
    },
  };
}

function makeConfigServiceFake() {
  return {
    get: (key: string) => {
      switch (key) {
        case 'jwt.secret':
          return 'test-access-secret';
        case 'jwt.refreshSecret':
          return 'test-refresh-secret';
        case 'jwt.accessExpiresIn':
          return '15m';
        case 'jwt.refreshExpiresIn':
          return '7d';
        default:
          return undefined;
      }
    },
  };
}

function makeCategoriesServiceFake() {
  const calls: string[] = [];
  return {
    calls,
    seedDefaults: async (userId: string) => {
      calls.push(userId);
      return [];
    },
  };
}

function makeAuthService(opts: {
  usersService: ReturnType<typeof makeUsersServiceFake>;
  categoriesService: ReturnType<typeof makeCategoriesServiceFake>;
  nonceStore: NonceStore;
}) {
  return new AuthService(
    opts.usersService as never,
    { signAsync: async () => 'signed-token' } as never,
    makeConfigServiceFake() as never,
    { session: { create: async () => ({}) } } as never,
    opts.nonceStore,
    {} as never,
    {} as never,
    {} as never,
    { setPrimaryAddress: async () => {} } as never,
    opts.categoriesService as never,
  );
}

describe('AuthService', () => {
  it('seeds default categories for a newly registered user', async () => {
    const usersService = makeUsersServiceFake();
    const categoriesService = makeCategoriesServiceFake();
    const service = makeAuthService({ usersService, categoriesService, nonceStore: new NonceStore() });

    const result = await service.register({ email: 'new@example.com', password: 'password123' });

    assert.equal(categoriesService.calls.length, 1);
    assert.equal(categoriesService.calls[0], result.user.id);
  });

  it('seeds default categories only the first time a wallet address signs in via SIWE', async () => {
    const usersService = makeUsersServiceFake();
    const categoriesService = makeCategoriesServiceFake();
    const nonceStore = new NonceStore();
    const service = makeAuthService({ usersService, categoriesService, nonceStore });

    const address = '0x1111111111111111111111111111111111111111';
    const originalVerify = SiweMessage.prototype.verify;
    (SiweMessage.prototype as { verify: unknown }).verify = async () => ({ success: true });

    try {
      const buildMessage = () =>
        new SiweMessage({
          domain: 'metaspend.app',
          address,
          statement: 'Sign in to MetaSpend',
          uri: 'https://metaspend.app',
          version: '1',
          chainId: 1,
          nonce: nonceStore.generate(),
          issuedAt: new Date().toISOString(),
        }).prepareMessage();

      await service.verifySiwe(buildMessage(), '0xfakesig');
      assert.equal(categoriesService.calls.length, 1, 'expected seedDefaults after first-time sign-in');

      await service.verifySiwe(buildMessage(), '0xfakesig');
      assert.equal(categoriesService.calls.length, 1, 'should not seed defaults again for a returning wallet');
    } finally {
      SiweMessage.prototype.verify = originalVerify;
    }
  });
});
