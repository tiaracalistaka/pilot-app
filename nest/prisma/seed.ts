import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');
  const existingUser = await prisma.user.findUnique({
    where: { username: 'johndoe' },
  });

  if (existingUser) {
    console.log('Database already contains seed data; skipping seed.');
    return;
  }

  const users = await Promise.all([
    prisma.user.upsert({
      where: { username: 'johndoe' },
      update: {},
      create: {
        id: 'pilot-001',
        username: 'johndoe',
        password: 'susiairtest',
        name: 'John Doe',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=johndoe',
        email: 'john.doe@susiair.com',
        role: 'pilot',
      },
    }),
  ]);

  console.log(`Created ${users.length} users`);
  const flightHoursData = [
    { date: '2024-12-27', hours: 4.5 },
    { date: '2024-12-28', hours: 0 },
    { date: '2024-12-30', hours: 6.0 },
    { date: '2025-01-02', hours: 5.5 },
    { date: '2025-01-03', hours: 4.0 },
    { date: '2025-01-06', hours: 6.5 },
    { date: '2025-01-07', hours: 5.0 },
    { date: '2025-01-08', hours: 4.5 },
    { date: '2025-01-12', hours: 3.5 },
    { date: '2025-01-13', hours: 5.0 },
  ];

  for (const fh of flightHoursData) {
    await prisma.flightHours.upsert({
      where: {
        userId_date: {
          userId: 'pilot-001',
          date: new Date(fh.date),
        },
      },
      update: { hours: fh.hours },
      create: {
        userId: 'pilot-001',
        date: new Date(fh.date),
        hours: fh.hours,
      },
    });
  }

  console.log(`Created ${flightHoursData.length} flight hours records`);

  const documentsData = [
    { name: 'Airline Transport Pilot Certificate (ATPL)', type: 'license', expiryDate: '2027-03-15', thresholdDays: 30 },
    { name: 'Class 1 Medical Certificate', type: 'medical', expiryDate: '2026-06-20', thresholdDays: 30 },
    { name: 'Type Rating - Cessna Grand Caravan', type: 'rating', expiryDate: '2027-01-10', thresholdDays: 30 },
    { name: 'Dangerous Goods Certificate', type: 'training', expiryDate: '2026-04-10', thresholdDays: 30 },
  ];

  for (const doc of documentsData) {
    await prisma.document.create({
      data: {
        userId: 'pilot-001',
        name: doc.name,
        type: doc.type,
        expiryDate: new Date(doc.expiryDate),
        thresholdDays: doc.thresholdDays,
      },
    });
  }

  console.log(`Created ${documentsData.length} documents`);

  const schedulesData = [
    { date: '2026-04-01', dutyType: 'DUTY', baseColor: '#0E2138', countSchedules: 2, countLogbooks: 2 },
    { date: '2026-04-02', dutyType: 'DUTY', baseColor: '#0E2138', countSchedules: 3, countLogbooks: 3 },
    { date: '2026-04-03', dutyType: 'RL', baseColor: '#22C5E8', countSchedules: 1, countLogbooks: 1 },
    { date: '2026-04-04', dutyType: 'SCK', baseColor: '#1FBF8F', countSchedules: 1, countLogbooks: 1 },
    { date: '2026-04-05', dutyType: 'DUTY', baseColor: '#0E2138', countSchedules: 2, countLogbooks: 1 },
    { date: '2026-04-06', dutyType: 'DUTY', baseColor: '#0E2138', countSchedules: 1, countLogbooks: 0 },
  ];

  for (const sch of schedulesData) {
    await prisma.schedule.create({
      data: {
        userId: 'pilot-001',
        date: new Date(sch.date),
        dutyType: sch.dutyType,
        baseColor: sch.baseColor,
        countSchedules: sch.countSchedules,
        countLogbooks: sch.countLogbooks,
      },
    });
  }

  console.log(`Created ${schedulesData.length} schedule records`);

  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
