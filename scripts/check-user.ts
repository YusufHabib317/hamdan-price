import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function checkUser() {
  const user = await prisma.user.findUnique({
    where: { email: 'hamdan.99@gmail.com' },
    include: { accounts: true }
  });
  
  console.log('User:', JSON.stringify(user, null, 2));
  await prisma.$disconnect();
}

checkUser();
