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

  create(data: { email: string; passwordHash?: string | null }): Promise<User> {
    return this.repo.create(data);
  }
}
