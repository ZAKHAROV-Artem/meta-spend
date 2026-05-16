import { Injectable } from '@nestjs/common';
import { User } from '@crypto-tracker/db';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findBySupabaseId(supabaseId: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { supabaseId } });
  }

  create(data: {
    email: string;
    passwordHash?: string | null;
    supabaseId?: string | null;
  }): Promise<User> {
    return this.prisma.user.create({ data });
  }

  setSupabaseId(id: string, supabaseId: string): Promise<User> {
    return this.prisma.user.update({ where: { id }, data: { supabaseId } });
  }
}
