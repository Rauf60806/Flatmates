import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { calculateGroupSplit } from '../src/services/split.service.js';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding Flatmates Demo Data ---');

  // Clear existing demo records
  await prisma.split.deleteMany({});
  await prisma.settlement.deleteMany({});
  await prisma.item.deleteMany({});
  await prisma.user.deleteMany({});

  const defaultPassword = 'Password123!';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(defaultPassword, salt);

  // 1. Create 4 demo flatmates
  const alex = await prisma.user.create({
    data: {
      name: 'Alex Rivera',
      email: 'alex@flatmates.local',
      passwordHash,
      role: 'admin',
      active: true,
    },
  });

  const sam = await prisma.user.create({
    data: {
      name: 'Sam Chen',
      email: 'sam@flatmates.local',
      passwordHash,
      role: 'member',
      active: true,
    },
  });

  const jordan = await prisma.user.create({
    data: {
      name: 'Jordan Lee',
      email: 'jordan@flatmates.local',
      passwordHash,
      role: 'member',
      active: true,
    },
  });

  const taylor = await prisma.user.create({
    data: {
      name: 'Taylor Swift',
      email: 'taylor@flatmates.local',
      passwordHash,
      role: 'member',
      active: true,
    },
  });

  const allMembers = [alex, sam, jordan, taylor];
  const memberIds = allMembers.map((m) => m.id);

  console.log('Created 4 flatmates (Alex, Sam, Jordan, Taylor).');

  // 2. Helper to record group items with exact remainder split
  const createGroupExpense = async (
    name: string,
    unitPrice: number,
    quantity: number,
    payer: typeof alex,
    daysAgo: number
  ) => {
    const total = unitPrice * quantity;
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);

    const splits = calculateGroupSplit(total, payer.id, memberIds);

    const item = await prisma.item.create({
      data: {
        name,
        price: unitPrice,
        quantity,
        total,
        type: 'group',
        paidById: payer.id,
        createdAt,
      },
    });

    await prisma.split.createMany({
      data: splits.map((s) => ({
        itemId: item.id,
        userId: s.userId,
        share: s.share,
      })),
    });

    return item;
  };

  // Helper to record individual items
  const createIndividualExpense = async (
    name: string,
    unitPrice: number,
    quantity: number,
    payer: typeof alex,
    daysAgo: number
  ) => {
    const total = unitPrice * quantity;
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);

    const item = await prisma.item.create({
      data: {
        name,
        price: unitPrice,
        quantity,
        total,
        type: 'individual',
        paidById: payer.id,
        createdAt,
      },
    });

    await prisma.split.create({
      data: {
        itemId: item.id,
        userId: payer.id,
        share: total,
      },
    });

    return item;
  };

  // 3. Create realistic expenses spanning the last 30 days
  await createGroupExpense('Supermarket Groceries & Pantry', 245000, 1, alex, 1); // ₹2,450
  await createGroupExpense('High-speed Wi-Fi Fiber 300Mbps', 119900, 1, sam, 3); // ₹1,199
  await createGroupExpense('Farm Fresh Milk & Organic Eggs', 7500, 2, jordan, 2); // ₹150
  await createGroupExpense('Cleaning Supplies & Trash Bags', 48000, 1, alex, 5); // ₹480
  await createGroupExpense('Cooking Oil & Rice (5kg)', 82000, 1, taylor, 7); // ₹820
  await createGroupExpense('Drinking Water Cans (20L x 4)', 9000, 4, sam, 9); // ₹360
  await createGroupExpense('Kitchen Paper Rolls & Sponges', 29000, 1, jordan, 12); // ₹290

  // Individual expenses
  await createIndividualExpense('Artisanal Espresso Roast', 68000, 1, alex, 0); // ₹680
  await createIndividualExpense('Gym Protein Shake & Shaker', 45000, 1, alex, 4); // ₹450
  await createIndividualExpense('Gluten-Free Oats Box', 32000, 1, sam, 6); // ₹320

  // 4. Create a sample settlement
  const settleDate = new Date();
  settleDate.setDate(settleDate.getDate() - 2);

  await prisma.settlement.create({
    data: {
      fromUserId: sam.id,
      toUserId: alex.id,
      amount: 50000, // ₹500
      createdAt: settleDate,
    },
  });

  console.log('Seeded realistic shared flat items and sample UPI settlement.');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
