import { Injectable } from '@nestjs/common';
import type { PortfolioOverview } from '@crypto-tracker/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PortfolioService {
  constructor(private readonly prisma: PrismaService) {}

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

  /**
   * Upsert the user's primary wallet address — recorded when they sign in with SIWE.
   * Existing balance fields are preserved when the row is updated.
   */
  async setPrimaryAddress(userId: string, address: string): Promise<void> {
    const normalized = address.toLowerCase();
    await this.prisma.portfolioAccount.upsert({
      where: { userId },
      create: { userId, address: normalized },
      update: { address: normalized },
    });
  }
}
