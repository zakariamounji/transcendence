import { prisma } from 'lib/prisma';

async function seedUsers() {
  console.log('Deleting users...');

  await prisma.user.deleteMany({}); // delete all existing users

  const total = await prisma.user.count()
  console.log(`Done. Total users in DB: ${total}`)
}

seedUsers().catch((error) => {
    console.error('Seed failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
