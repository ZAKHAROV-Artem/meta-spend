import { Injectable } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '@crypto-tracker/shared';

const TOKEN_BYTES = 32;

@Injectable()
export class ExtensionTokenService {
  constructor(private readonly prisma: PrismaService) {}

  /** Persists a hashed token and returns the raw secret once (show to client only here). */
  async issueToken(userId: string, label?: string): Promise<string> {
    const rawToken = randomBytes(TOKEN_BYTES).toString('hex');
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    await this.prisma.extensionToken.create({
      data: {
        userId,
        tokenHash,
        label: label ?? 'Browser extension',
        expiresAt,
      },
    });
    return rawToken;
  }

  async validateAndTouch(rawToken: string): Promise<AuthUser | null> {
    const tokenHash = this.hashToken(rawToken);
    const row = await this.prisma.extensionToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
    if (!row || (row.expiresAt && row.expiresAt < new Date())) {
      return null;
    }
    await this.prisma.extensionToken.update({
      where: { id: row.id },
      data: { lastUsedAt: new Date() },
    });
    return { id: row.user.id, email: row.user.email };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
