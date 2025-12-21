import 'dotenv/config';
import { prisma } from '../src/libs/prisma';
import { auth } from '../src/libs/auth';

async function createAdmin() {
  const email = 'hamdan.99@gmail.com';
  const password = '12345678';
  const name = 'Admin';

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return;
    }

    // Use better-auth's signUp to create user with proper password hashing
    await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });
  } catch {
    //
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
