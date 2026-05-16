import { Injectable } from '@nestjs/common';
import { User } from '@crypto-tracker/db';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly repo: UsersRepository) {}

  findByEmail(email: string) {
    return this.repo.findByEmail(email);
  }

  findById(id: string) {
    return this.repo.findById(id);
  }

  findBySupabaseId(supabaseId: string) {
    return this.repo.findBySupabaseId(supabaseId);
  }

  create(data: { email: string; passwordHash?: string | null; supabaseId?: string | null }) {
    return this.repo.create(data);
  }

  /**
   * Provision a local User row for a Supabase-authenticated principal.
   * - Looks up by supabaseId first.
   * - Falls back to email match (links existing local user to Supabase).
   * - Creates a fresh row otherwise.
   */
  async provisionFromSupabase(params: { supabaseId: string; email: string }): Promise<User> {
    const bySupabase = await this.repo.findBySupabaseId(params.supabaseId);
    if (bySupabase) return bySupabase;

    const byEmail = await this.repo.findByEmail(params.email);
    if (byEmail) {
      if (!byEmail.supabaseId) {
        return this.repo.setSupabaseId(byEmail.id, params.supabaseId);
      }
      return byEmail;
    }

    return this.repo.create({ email: params.email, supabaseId: params.supabaseId });
  }
}
