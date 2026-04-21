import { Injectable, ConflictException } from '@nestjs/common';
import { Prisma } from '@crypto-tracker/db';
import type { Wallet as WalletResponse } from '@crypto-tracker/shared';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWalletDto } from './dto/create-wallet.dto';

@Injectable()
export class WalletsService {
  private walletSyncColumnsAvailablePromise?: Promise<boolean>;

  constructor(private readonly prisma: PrismaService) {}

  async findByUser(userId: string): Promise<WalletResponse[]> {
    const wallets = await this.prisma.wallet.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      select: await this.getWalletSelect(),
    });

    return wallets.map((wallet) => this.toWalletResponse(wallet));
  }

  async findById(userId: string, walletId: string): Promise<WalletResponse | null> {
    const wallet = await this.prisma.wallet.findFirst({
      where: { id: walletId, userId },
      select: await this.getWalletSelect(),
    });

    return wallet ? this.toWalletResponse(wallet) : null;
  }

  async create(userId: string, dto: CreateWalletDto): Promise<WalletResponse> {
    const address = dto.address.toLowerCase();
    const existing = await this.prisma.wallet.findUnique({
      where: { userId_address_chainId: { userId, address, chainId: dto.chainId } },
      select: { id: true },
    });
    if (existing) throw new ConflictException('Wallet already added');

    const wallet = await this.prisma.wallet.create({
      data: { userId, address, chainId: dto.chainId, label: dto.label },
      select: await this.getWalletSelect(),
    });

    return this.toWalletResponse(wallet);
  }

  async remove(userId: string, walletId: string): Promise<void> {
    await this.prisma.wallet.deleteMany({ where: { id: walletId, userId } });
  }

  private async hasWalletSyncColumns(): Promise<boolean> {
    if (!this.walletSyncColumnsAvailablePromise) {
      this.walletSyncColumnsAvailablePromise = this.prisma
        .$queryRaw<Array<{ exists: boolean }>>(Prisma.sql`
          SELECT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'wallets'
              AND column_name = 'lastSyncedAt'
          ) AS "exists"
        `)
        .then((rows) => rows[0]?.exists ?? false)
        .catch(() => false);
    }

    return this.walletSyncColumnsAvailablePromise;
  }

  private async getWalletSelect() {
    const includeSyncFields = await this.hasWalletSyncColumns();

    return {
      id: true,
      userId: true,
      address: true,
      chainId: true,
      label: true,
      isVerified: true,
      createdAt: true,
      ...(includeSyncFields
        ? {
            lastSyncedAt: true,
            syncStatus: true,
          }
        : {}),
    };
  }

  private toWalletResponse(wallet: {
    id: string;
    userId: string;
    address: string;
    chainId: number;
    label: string | null;
    isVerified: boolean;
    createdAt: Date;
    lastSyncedAt?: Date | null;
    syncStatus?: 'IDLE' | 'SYNCING' | 'FAILED';
  }): WalletResponse {
    return {
      id: wallet.id,
      userId: wallet.userId,
      address: wallet.address,
      chainId: wallet.chainId,
      label: wallet.label,
      isVerified: wallet.isVerified,
      createdAt: wallet.createdAt.toISOString(),
      lastSyncedAt: wallet.lastSyncedAt?.toISOString() ?? null,
      syncStatus: wallet.syncStatus ?? 'IDLE',
    };
  }
}
