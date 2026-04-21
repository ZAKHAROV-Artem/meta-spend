import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SYSTEM_CATEGORIES = [
  { name: 'Transfer Out', color: '#ef4444', icon: 'arrow-up-right', isSystem: true, userId: null },
  { name: 'Transfer In', color: '#22c55e', icon: 'arrow-down-left', isSystem: true, userId: null },
  { name: 'Swap', color: '#a855f7', icon: 'arrows-right-left', isSystem: true, userId: null },
  { name: 'Bridge', color: '#3b82f6', icon: 'waypoints', isSystem: true, userId: null },
  { name: 'Gas Fee', color: '#f97316', icon: 'flame', isSystem: true, userId: null },
  { name: 'Contract Interaction', color: '#8b5cf6', icon: 'file-code', isSystem: true, userId: null },
  { name: 'Unknown', color: '#6b7280', icon: 'circle-help', isSystem: true, userId: null },
];

async function main() {
  console.log('Seeding system categories...');

  const existing = await prisma.category.findMany({ where: { isSystem: true } });
  const existingNames = new Set(existing.map((c) => c.name));

  const toCreate = SYSTEM_CATEGORIES.filter((c) => !existingNames.has(c.name));

  if (toCreate.length > 0) {
    await prisma.category.createMany({ data: toCreate });
    console.log(`Created ${toCreate.length} system categories.`);
  } else {
    console.log('System categories already seeded.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
