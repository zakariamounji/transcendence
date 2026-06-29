import { UserRole, UserStatus } from '../generated/prisma/client';
import { faker } from '@faker-js/faker';
import { prisma } from 'lib/prisma';

const USERS_COUNT = 20;

async function seedUsers() {
  console.log('Deleting users...');

  await prisma.user.deleteMany({
    
  }) // this deletes all users in the database

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
