import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prismaClient = new PrismaClient();
const PASSWORD_DEFAULT = 'User@123';

async function main() {
  const listUsers = await prismaClient.user.createMany({
    data: [
      {
        name: 'Admin',
        email: 'admin@gmail.com',
        password: await bcrypt.hash(PASSWORD_DEFAULT, 10),
      },
      {
        name: 'User',
        email: 'user@gmail.com',
        password: await bcrypt.hash(PASSWORD_DEFAULT, 10),
      },
      {
        name: 'Manager',
        email: 'manager@gmail.com',
        password: await bcrypt.hash(PASSWORD_DEFAULT, 10),
      },
    ],
  });

  const listRoles = await prismaClient.role.createMany({
    data: [
      {
        name: 'admin',
      },
      {
        name: 'user',
      },
      {
        name: 'manager',
      },
    ],
  });

  const listPermissions = await prismaClient.permission.createMany({
    data: [
      {
        action: 'read',
        subject: 'all',
      },
      {
        action: 'write',
        subject: 'product',
      },
      {
        action: 'delete',
        subject: 'product',
      },
    ],
  });
}
