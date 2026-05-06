import { Injectable } from '@nestjs/common';
import type { PortfolioOverview, PortfolioSyncState, PortfolioSyncStatus } from '@crypto-tracker/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PortfolioService {
  constructor(private readonly prisma: PrismaService) {}

  async setPrimaryAddress(userId: string, address: string): Promise<void> {
    await this.prisma.portfolioAccount.upsert({
      where: { userId },
      create: { userId, address: address.toLowerCase() },
      update: { address: address.toLowerCase() },
    });
  }

  async connect(userId: string, address: string): Promise<PortfolioOverview> {
    await this.setPrimaryAddress(userId, address.toLowerCase());
    return this.getOverview(userId);
  }

  async refresh(userId: string): Promise<PortfolioSyncStatus> {
    await this.prisma.portfolioAccount.updateMany({
      where: { userId },
      data: {
        lastRefreshRequestedAt: new Date(),
        lastSuccessfulSyncAt: new Date(),
        lastSyncState: 'IDLE',
        lastSyncError: null,
      },
    });
    return this.getSyncStatus(userId);
  }

  async getOverview(userId: string): Promise<PortfolioOverview> {
    const syncStatus = await this.getSyncStatus(userId);
    return {
      address: syncStatus.address,
      holdings: [],
      totalBalanceUsd: '0',
      totalTransactions: 0,
      totalInflowsUsd: '0',
      totalOutflowsUsd: '0',
      syncStatus,
    };
  }

  async getSyncStatus(userId: string): Promise<PortfolioSyncStatus> {
    const account = await this.prisma.portfolioAccount.findUnique({
      where: { userId },
      select: {
        address: true,
        lastSuccessfulSyncAt: true,
        lastRefreshRequestedAt: true,
        lastSyncError: true,
        lastSyncState: true,
      },
    });

    const address = account?.address?.toLowerCase() ?? null;
    let state: PortfolioSyncState = 'UNCONFIGURED';
    if (address) state = account?.lastSyncState === 'SYNCING' ? 'IDLE' : 'IDLE';

    return {
      address,
      state,
      isStale: false,
      lastSyncedAt: account?.lastSuccessfulSyncAt?.toISOString() ?? null,
      lastRefreshRequestedAt: account?.lastRefreshRequestedAt?.toISOString() ?? null,
      failedChains: [],
      message: address
        ? 'CryptoTrack focuses on MetaMask Card spend analytics (no on-chain sync).'
        : 'Connect MetaMask SIWE once to personalize your workspace.',
    };
  }
}
