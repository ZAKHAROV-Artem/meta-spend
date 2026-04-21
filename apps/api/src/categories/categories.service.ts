import { Injectable, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Category } from '@crypto-tracker/db';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string): Promise<Category[]> {
    return this.prisma.category.findMany({
      where: { OR: [{ isSystem: true }, { userId }] },
      orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
    });
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
