import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const config = new ConfigService();

async function main() {
  const roles = ['admin', 'trainner', 'learner'];

  // Seed Roles
  for (const name of roles) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // Find admin role
  const adminRole = await prisma.role.findUnique({
    where: { name: 'admin' },
  });

  if (!adminRole) {
    throw new Error('Admin role not found!');
  }

  // Check if admin user already exists
  const adminEmail = 'admin@gmail.com';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const adminPassword = config.get('ADMIN_PASSWORD') || 'Admin@123'; // Use environment variable or default password
    // Create admin user
    const hashedPassword = await bcrypt.hash(adminPassword, 10); // hash the password

    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
      },
    });

    // Assign admin role to user
    await prisma.userRole.create({
      data: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    });

    console.log('Admin user created!');
  } else {
    console.log('Admin user already exists.');
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
