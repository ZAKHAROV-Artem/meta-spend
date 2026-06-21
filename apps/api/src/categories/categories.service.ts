import { Injectable, ConflictException, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { Category } from '@metaspend/db';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

type SubcategoryDef = { name: string; color: string; icon: string };

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

const DEFAULT_CATEGORIES: CreateCategoryDto[] = [
  { name: 'Food & Dining', color: '#f97316', icon: 'utensils' },
  { name: 'Coffee & Drinks', color: '#92400e', icon: 'coffee' },
  { name: 'Shopping', color: '#ec4899', icon: 'shopping-bag' },
  { name: 'Transport', color: '#3b82f6', icon: 'car' },
  { name: 'Entertainment', color: '#eab308', icon: 'popcorn' },
  { name: 'Subscriptions', color: '#8b5cf6', icon: 'repeat' },
  { name: 'Bills & Utilities', color: '#64748b', icon: 'plug' },
  { name: 'Health & Fitness', color: '#ef4444', icon: 'heart-pulse' },
  { name: 'Travel', color: '#06b6d4', icon: 'plane' },
  { name: 'Groceries', color: '#22c55e', icon: 'shopping-basket' },
];

const DEFAULT_SUBCATEGORIES: Record<string, SubcategoryDef[]> = {
  'Groceries': [
    { name: 'Supermarket', color: '#16a34a', icon: 'store' },
    { name: 'Market & bazaar', color: '#15803d', icon: 'tent' },
    { name: 'Convenience store', color: '#22c55e', icon: 'shopping-basket' },
    { name: 'Wholesale club', color: '#4ade80', icon: 'package' },
    { name: 'Organic & health food', color: '#86efac', icon: 'leaf' },
  ],
  'Restaurants': [
    { name: 'Fine dining', color: '#ea580c', icon: 'utensils-crossed' },
    { name: 'Casual dining', color: '#f97316', icon: 'utensils' },
    { name: 'Food delivery', color: '#fb923c', icon: 'bike' },
    { name: 'Buffet', color: '#fdba74', icon: 'chef-hat' },
  ],
  'Coffee': [
    { name: 'Cafe', color: '#78350f', icon: 'coffee' },
    { name: 'Coffee chain', color: '#92400e', icon: 'cup-soda' },
    { name: 'Tea house', color: '#b45309', icon: 'leaf' },
  ],
  'Fast food': [
    { name: 'Burgers', color: '#c2410c', icon: 'beef' },
    { name: 'Pizza', color: '#ea580c', icon: 'pizza' },
    { name: 'Sandwiches & wraps', color: '#f97316', icon: 'sandwich' },
    { name: 'Asian fast food', color: '#fb923c', icon: 'utensils' },
    { name: 'Fried chicken', color: '#fdba74', icon: 'drumstick' },
    { name: 'Ice cream & desserts', color: '#fed7aa', icon: 'ice-cream' },
  ],
  'Transport': [
    { name: 'Taxi & rideshare', color: '#1d4ed8', icon: 'car' },
    { name: 'Bus & metro', color: '#2563eb', icon: 'bus' },
    { name: 'Train & rail', color: '#3b82f6', icon: 'train' },
    { name: 'Parking', color: '#60a5fa', icon: 'square-parking' },
    { name: 'Fuel & charging', color: '#93c5fd', icon: 'fuel' },
    { name: 'Car rental', color: '#bfdbfe', icon: 'car-front' },
    { name: 'Tolls', color: '#dbeafe', icon: 'badge-dollar-sign' },
    { name: 'Bike & scooter', color: '#a5b4fc', icon: 'bike' },
  ],
  'Travel': [
    { name: 'Flights', color: '#0891b2', icon: 'plane' },
    { name: 'Hotels & resorts', color: '#06b6d4', icon: 'hotel' },
    { name: 'Vacation rental', color: '#22d3ee', icon: 'house' },
    { name: 'Tours & excursions', color: '#67e8f9', icon: 'map' },
    { name: 'Travel insurance', color: '#a5f3fc', icon: 'shield' },
    { name: 'Airport services', color: '#cffafe', icon: 'plane-landing' },
  ],
  'Shopping': [
    { name: 'Electronics', color: '#be185d', icon: 'laptop' },
    { name: 'Home goods', color: '#db2777', icon: 'sofa' },
    { name: 'Books & stationery', color: '#ec4899', icon: 'book' },
    { name: 'Sports & outdoors', color: '#f472b6', icon: 'tent' },
    { name: 'Beauty & personal care', color: '#f9a8d4', icon: 'sparkles' },
    { name: 'Toys & games', color: '#fce7f3', icon: 'gamepad-2' },
    { name: 'Luxury goods', color: '#9d174d', icon: 'gem' },
  ],
  'Subscriptions': [
    { name: 'Streaming video', color: '#6d28d9', icon: 'tv' },
    { name: 'Music streaming', color: '#7c3aed', icon: 'music' },
    { name: 'Cloud storage', color: '#8b5cf6', icon: 'cloud' },
    { name: 'News & magazines', color: '#a78bfa', icon: 'newspaper' },
    { name: 'Software & apps', color: '#c4b5fd', icon: 'app-window' },
    { name: 'Gaming subscription', color: '#ddd6fe', icon: 'gamepad-2' },
    { name: 'Fitness app', color: '#ede9fe', icon: 'dumbbell' },
  ],
  'Entertainment': [
    { name: 'Cinema & theater', color: '#a16207', icon: 'clapperboard' },
    { name: 'Concerts & events', color: '#ca8a04', icon: 'music-2' },
    { name: 'Amusement parks', color: '#eab308', icon: 'ferris-wheel' },
    { name: 'Sports events', color: '#facc15', icon: 'trophy' },
    { name: 'Museums & galleries', color: '#fde047', icon: 'landmark' },
    { name: 'Nightlife', color: '#fef08a', icon: 'moon' },
  ],
  'Health': [
    { name: 'Doctor & clinic', color: '#b91c1c', icon: 'stethoscope' },
    { name: 'Hospital', color: '#dc2626', icon: 'hospital' },
    { name: 'Dentist', color: '#ef4444', icon: 'smile' },
    { name: 'Optician', color: '#f87171', icon: 'eye' },
    { name: 'Mental health', color: '#fca5a5', icon: 'brain' },
    { name: 'Lab tests', color: '#fecaca', icon: 'flask-conical' },
    { name: 'Physiotherapy', color: '#fee2e2', icon: 'activity' },
  ],
  'Pharmacy': [
    { name: 'Prescription drugs', color: '#0f766e', icon: 'pill' },
    { name: 'Over-the-counter', color: '#0d9488', icon: 'tablets' },
    { name: 'Vitamins & supplements', color: '#14b8a6', icon: 'flask-conical' },
    { name: 'Medical devices', color: '#2dd4bf', icon: 'stethoscope' },
  ],
  'Bars & alcohol': [
    { name: 'Bars & pubs', color: '#92400e', icon: 'beer' },
    { name: 'Nightclubs', color: '#a16207', icon: 'music-2' },
    { name: 'Liquor stores', color: '#b45309', icon: 'wine' },
    { name: 'Wine bars', color: '#d97706', icon: 'grape' },
  ],
  'Sports & fitness': [
    { name: 'Gym membership', color: '#991b1b', icon: 'dumbbell' },
    { name: 'Sports classes', color: '#b91c1c', icon: 'users' },
    { name: 'Sports gear', color: '#dc2626', icon: 'shirt' },
    { name: 'Yoga & pilates', color: '#ef4444', icon: 'person-standing' },
    { name: 'Swimming', color: '#f87171', icon: 'waves' },
    { name: 'Cycling', color: '#fca5a5', icon: 'bike' },
  ],
  'Pets': [
    { name: 'Vet & medical', color: '#86198f', icon: 'stethoscope' },
    { name: 'Pet food', color: '#a21caf', icon: 'bone' },
    { name: 'Grooming', color: '#c026d3', icon: 'scissors' },
    { name: 'Pet supplies', color: '#d946ef', icon: 'paw-print' },
    { name: 'Pet insurance', color: '#e879f9', icon: 'shield' },
  ],
  'Education': [
    { name: 'School & university', color: '#3730a3', icon: 'graduation-cap' },
    { name: 'Online courses', color: '#4338ca', icon: 'monitor-play' },
    { name: 'Books & materials', color: '#4f46e5', icon: 'book-open' },
    { name: 'Tutoring', color: '#6366f1', icon: 'user-check' },
    { name: 'Language learning', color: '#818cf8', icon: 'languages' },
    { name: 'Certification & exams', color: '#a5b4fc', icon: 'badge-check' },
  ],
  'Clothing': [
    { name: 'Formal wear', color: '#9d174d', icon: 'shirt' },
    { name: 'Casual wear', color: '#be185d', icon: 'shirt' },
    { name: 'Shoes & footwear', color: '#db2777', icon: 'footprints' },
    { name: 'Accessories', color: '#ec4899', icon: 'watch' },
    { name: 'Sportswear', color: '#f472b6', icon: 'shirt' },
    { name: 'Underwear & socks', color: '#f9a8d4', icon: 'shirt' },
  ],
  'Gifts & donations': [
    { name: 'Gifts', color: '#854d0e', icon: 'gift' },
    { name: 'Charity & donations', color: '#92400e', icon: 'heart-handshake' },
    { name: 'Tips', color: '#b45309', icon: 'hand-coins' },
    { name: 'Flowers & plants', color: '#d97706', icon: 'flower-2' },
  ],
  'Home & garden': [
    { name: 'Furniture', color: '#44403c', icon: 'sofa' },
    { name: 'Home appliances', color: '#57534e', icon: 'microwave' },
    { name: 'Decor & accessories', color: '#78716c', icon: 'lamp' },
    { name: 'Garden & outdoor', color: '#a8a29e', icon: 'sprout' },
    { name: 'DIY & tools', color: '#d6d3d1', icon: 'hammer' },
    { name: 'Cleaning supplies', color: '#e7e5e4', icon: 'sparkles' },
  ],
  'Rent & housing': [
    { name: 'Rent', color: '#4c1d95', icon: 'house' },
    { name: 'Mortgage', color: '#5b21b6', icon: 'building-2' },
    { name: 'Property taxes', color: '#6d28d9', icon: 'receipt' },
    { name: 'HOA fees', color: '#7c3aed', icon: 'users' },
  ],
  'Utilities': [
    { name: 'Electricity', color: '#334155', icon: 'zap' },
    { name: 'Water', color: '#475569', icon: 'droplets' },
    { name: 'Gas', color: '#64748b', icon: 'flame' },
    { name: 'Internet', color: '#94a3b8', icon: 'wifi' },
    { name: 'Phone & mobile', color: '#cbd5e1', icon: 'smartphone' },
    { name: 'TV & cable', color: '#e2e8f0', icon: 'tv' },
  ],
  'Insurance': [
    { name: 'Health insurance', color: '#155e75', icon: 'heart-pulse' },
    { name: 'Car insurance', color: '#0e7490', icon: 'car' },
    { name: 'Life insurance', color: '#0891b2', icon: 'shield-heart' },
    { name: 'Home insurance', color: '#06b6d4', icon: 'house' },
    { name: 'Travel insurance', color: '#22d3ee', icon: 'plane' },
  ],
  'Cash & ATM': [
    { name: 'ATM withdrawal', color: '#3f6212', icon: 'banknote' },
    { name: 'Cash conversion', color: '#65a30d', icon: 'arrow-left-right' },
    { name: 'Money transfer', color: '#84cc16', icon: 'send' },
  ],
  'Business': [
    { name: 'Office supplies', color: '#1e293b', icon: 'briefcase' },
    { name: 'Professional services', color: '#334155', icon: 'handshake' },
    { name: 'Software tools', color: '#475569', icon: 'wrench' },
    { name: 'Business travel', color: '#64748b', icon: 'plane' },
    { name: 'Marketing & ads', color: '#94a3b8', icon: 'megaphone' },
    { name: 'Coworking', color: '#cbd5e1', icon: 'building-2' },
  ],
  'Fees': [
    { name: 'Bank fees', color: '#4b5563', icon: 'building-2' },
    { name: 'Transaction fees', color: '#6b7280', icon: 'receipt' },
    { name: 'Service charges', color: '#9ca3af', icon: 'badge-dollar-sign' },
    { name: 'Late fees', color: '#d1d5db', icon: 'clock' },
  ],
  'Other': [
    { name: 'Miscellaneous', color: '#6b7280', icon: 'tag' },
    { name: 'Unclear charge', color: '#94a3b8', icon: 'circle-help' },
    { name: 'Refund', color: '#9ca3af', icon: 'rotate-ccw' },
  ],
};

const STARTER_DEFAULT_SUBCATEGORIES: Record<string, SubcategoryDef[]> = {
  'Food & Dining': [
    { name: 'Restaurants', color: '#ea580c', icon: 'utensils' },
    { name: 'Fast food', color: '#f97316', icon: 'sandwich' },
    { name: 'Food delivery', color: '#fb923c', icon: 'bike' },
    { name: 'Bakery', color: '#fdba74', icon: 'croissant' },
  ],
  'Coffee & Drinks': [
    { name: 'Cafe', color: '#78350f', icon: 'coffee' },
    { name: 'Coffee chain', color: '#92400e', icon: 'cup-soda' },
    { name: 'Tea house', color: '#b45309', icon: 'leaf' },
    { name: 'Juice & smoothies', color: '#d97706', icon: 'glass-water' },
  ],
  'Bills & Utilities': [
    { name: 'Electricity', color: '#334155', icon: 'zap' },
    { name: 'Water', color: '#475569', icon: 'droplets' },
    { name: 'Gas', color: '#64748b', icon: 'flame' },
    { name: 'Internet', color: '#94a3b8', icon: 'wifi' },
    { name: 'Phone & mobile', color: '#cbd5e1', icon: 'smartphone' },
    { name: 'TV & cable', color: '#e2e8f0', icon: 'tv' },
  ],
  'Health & Fitness': [
    { name: 'Doctor & clinic', color: '#b91c1c', icon: 'stethoscope' },
    { name: 'Pharmacy', color: '#dc2626', icon: 'pill' },
    { name: 'Gym membership', color: '#ef4444', icon: 'dumbbell' },
    { name: 'Sports classes', color: '#f87171', icon: 'users' },
    { name: 'Mental health', color: '#fca5a5', icon: 'brain' },
  ],
};

const DEFAULT_SUBCATEGORIES_BY_PARENT: Record<string, SubcategoryDef[]> = {
  ...DEFAULT_SUBCATEGORIES,
  ...STARTER_DEFAULT_SUBCATEGORIES,
};

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string): Promise<Category[]> {
    return this.prisma.category.findMany({
      where: { userId, parentId: null },
      orderBy: { name: 'asc' },
      include: {
        subCategories: { orderBy: { name: 'asc' } },
      },
    }) as Promise<Category[]>;
  }

  async createDefaults(userId: string): Promise<Category[]> {
    await this.createMissingParentCategories(userId, DEFAULT_SPENDING_CATEGORIES);
    await this.seedDefaultSubcategories(userId);
    return this.findAll(userId);
  }

  async seedDefaults(userId: string): Promise<Category[]> {
    await this.createMissingParentCategories(userId, DEFAULT_CATEGORIES);
    await this.seedDefaultSubcategories(userId);
    return this.findAll(userId);
  }

  async seedDefaultSubcategories(userId: string): Promise<Category[]> {
    const parentNames = Object.keys(DEFAULT_SUBCATEGORIES_BY_PARENT);
    const parents = await this.prisma.category.findMany({
      where: { userId, name: { in: parentNames }, parentId: null },
      select: { id: true, name: true },
    });

    for (const parent of parents) {
      const defs = DEFAULT_SUBCATEGORIES_BY_PARENT[parent.name];
      if (!defs || defs.length === 0) continue;

      const existingSubs = await this.prisma.category.findMany({
        where: { userId, parentId: parent.id },
        select: { name: true },
      });
      const existingSubNames = new Set(existingSubs.map((s) => s.name.toLowerCase()));
      const missingSubs = defs.filter((d) => !existingSubNames.has(d.name.toLowerCase()));

      if (missingSubs.length > 0) {
        await this.prisma.category.createMany({
          data: missingSubs.map((d) => ({ ...d, userId, parentId: parent.id })),
          skipDuplicates: true,
        });
      }
    }

    return this.findAll(userId);
  }

  private async createMissingParentCategories(userId: string, defaults: CreateCategoryDto[]): Promise<void> {
    const existing = await this.prisma.category.findMany({
      where: {
        userId,
        name: { in: defaults.map((c) => c.name) },
        parentId: null,
      },
      select: { name: true },
    });
    const existingNames = new Set(existing.map((c) => c.name.toLowerCase()));
    const missingParents = defaults.filter(
      (c) => !existingNames.has(c.name.toLowerCase()),
    );

    if (missingParents.length > 0) {
      await this.prisma.category.createMany({
        data: missingParents.map((c) => ({ ...c, userId })),
        skipDuplicates: true,
      });
    }
  }

  async create(userId: string, dto: CreateCategoryDto): Promise<Category> {
    const parentId = dto.parentId ?? null;
    if (dto.parentId) {
      const parent = await this.prisma.category.findFirst({
        where: { id: dto.parentId, userId },
      });
      if (!parent) throw new NotFoundException('Parent category not found');
      if (parent.parentId !== null) {
        throw new BadRequestException('Subcategories cannot have sub-subcategories');
      }
    }

    const existing = await this.prisma.category.findFirst({
      where: { userId, name: dto.name, parentId },
    });
    if (existing) throw new ConflictException('Category name already exists');
    return this.prisma.category.create({ data: { ...dto, userId } });
  }

  async update(userId: string, id: string, dto: Partial<CreateCategoryDto>): Promise<Category> {
    const cat = await this.prisma.category.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Category not found');
    if (cat.isSystem || cat.userId !== userId) throw new ForbiddenException('Cannot edit system category');

    const nextParentId = dto.parentId === undefined ? cat.parentId : dto.parentId ?? null;
    if (nextParentId) {
      if (nextParentId === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }
      const parent = await this.prisma.category.findFirst({
        where: { id: nextParentId, userId },
      });
      if (!parent) throw new NotFoundException('Parent category not found');
      if (parent.parentId !== null) {
        throw new BadRequestException('Subcategories cannot have sub-subcategories');
      }
    }

    const nextName = dto.name ?? cat.name;
    if (nextName !== cat.name || nextParentId !== cat.parentId) {
      const existing = await this.prisma.category.findFirst({
        where: { userId, name: nextName, parentId: nextParentId, id: { not: id } },
      });
      if (existing) throw new ConflictException('Category name already exists');
    }

    return this.prisma.category.update({ where: { id }, data: dto });
  }

  async remove(userId: string, id: string): Promise<void> {
    const cat = await this.prisma.category.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Category not found');
    if (cat.isSystem || cat.userId !== userId) throw new ForbiddenException('Cannot delete system category');
    await this.prisma.category.delete({ where: { id } });
  }
}
