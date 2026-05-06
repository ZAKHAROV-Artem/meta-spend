import { Injectable, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Category } from '@crypto-tracker/db';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

const DEFAULT_SPENDING_CATEGORIES: CreateCategoryDto[] = [
  { name: 'Groceries', color: '#22c55e', icon: 'shopping-basket' },
  { name: 'Restaurants', color: '#f97316', icon: 'utensils' },
  { name: 'Coffee', color: '#92400e', icon: 'coffee' },
  { name: 'Fast food', color: '#ea580c', icon: 'sandwich' },
  { name: 'Transport', color: '#3b82f6', icon: 'car' },
  { name: 'Travel', color: '#06b6d4', icon: 'plane' },
  { name: 'Shopping', color: '#ec4899', icon: 'shopping-bag' },
  { name: 'Subscriptions', color: '#8b5cf6', icon: 'repeat' },
  { name: 'Entertainment', color: '#eab308', icon: 'popcorn' },
  { name: 'Health', color: '#ef4444', icon: 'heart-pulse' },
  { name: 'Pharmacy', color: '#0d9488', icon: 'pill' },
  { name: 'Bars & alcohol', color: '#b45309', icon: 'beer' },
  { name: 'Sports & fitness', color: '#dc2626', icon: 'dumbbell' },
  { name: 'Pets', color: '#c026d3', icon: 'paw-print' },
  { name: 'Education', color: '#4f46e5', icon: 'graduation-cap' },
  { name: 'Clothing', color: '#be185d', icon: 'shirt' },
  { name: 'Gifts & donations', color: '#ca8a04', icon: 'gift' },
  { name: 'Home & garden', color: '#57534e', icon: 'sprout' },
  { name: 'Rent & housing', color: '#7c3aed', icon: 'house' },
  { name: 'Utilities', color: '#64748b', icon: 'plug' },
  { name: 'Insurance', color: '#0e7490', icon: 'shield' },
  { name: 'Cash & ATM', color: '#65a30d', icon: 'banknote' },
  { name: 'Business', color: '#334155', icon: 'briefcase' },
  { name: 'Fees', color: '#6b7280', icon: 'receipt' },
  { name: 'Other', color: '#94a3b8', icon: 'tag' },
];

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string): Promise<Category[]> {
    return this.prisma.category.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  async createDefaults(userId: string): Promise<Category[]> {
    const existing = await this.prisma.category.findMany({
      where: {
        userId,
        name: { in: DEFAULT_SPENDING_CATEGORIES.map((category) => category.name) },
      },
      select: { name: true },
    });
    const existingNames = new Set(existing.map((category) => category.name.toLowerCase()));
    const missing = DEFAULT_SPENDING_CATEGORIES.filter((category) => !existingNames.has(category.name.toLowerCase()));

    if (missing.length > 0) {
      await this.prisma.category.createMany({
        data: missing.map((category) => ({ ...category, userId })),
        skipDuplicates: true,
      });
    }

    return this.findAll(userId);
  }

  async create(userId: string, dto: CreateCategoryDto): Promise<Category> {
    const existing = await this.prisma.category.findFirst({
      where: { userId, name: dto.name },
    });
    if (existing) throw new ConflictException('Category name already exists');
    return this.prisma.category.create({ data: { ...dto, userId } });
  }

  async update(userId: string, id: string, dto: Partial<CreateCategoryDto>): Promise<Category> {
    const cat = await this.prisma.category.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Category not found');
    if (cat.isSystem || cat.userId !== userId) throw new ForbiddenException('Cannot edit system category');
    return this.prisma.category.update({ where: { id }, data: dto });
  }

  async remove(userId: string, id: string): Promise<void> {
    const cat = await this.prisma.category.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Category not found');
    if (cat.isSystem || cat.userId !== userId) throw new ForbiddenException('Cannot delete system category');
    await this.prisma.category.delete({ where: { id } });
  }
}
