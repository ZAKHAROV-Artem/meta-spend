import { Injectable } from '@nestjs/common';
import type { PortfolioOverview } from '@crypto-tracker/shared';
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

  async getOverview(userId: string): Promise<PortfolioOverview> {
    const account = await this.prisma.portfolioAccount.findUnique({
      where: { userId },
      select: {
        address: true,
        cardBalanceAmount: true,
        cardBalanceCurrency: true,
      },
    });

    const cardBalance =
      account?.cardBalanceAmount != null && account.cardBalanceCurrency
        ? {
            amount: account.cardBalanceAmount.toString(),
            currency: account.cardBalanceCurrency,
          }
        : null;

    return {
      address: account?.address?.toLowerCase() ?? null,
      cardBalance,
    };
  }
}
