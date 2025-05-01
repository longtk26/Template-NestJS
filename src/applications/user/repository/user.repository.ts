import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { PrismaService } from 'src/core/orm/prisma';
import {
  CreateUserRepository,
  UpdateUserRepository,
} from '../types/user.types';
import { BaseRepository } from 'src/core/repository/base.repository';
import { Prisma, User as PrismaUser } from '@prisma/client';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';

@Injectable()
export class UserRepository extends BaseRepository<
  PrismaUser,
  Prisma.XOR<Prisma.UserCreateInput, Prisma.UserUncheckedCreateInput>,
  Prisma.UserWhereInput
> {
  protected readonly modelName: string = 'user';

  constructor(txHost: TransactionHost<TransactionalAdapterPrisma>) {
    super(txHost);
  }

  async getUserByEmail(email: string) {
    const user = this.prisma.tx.user.findUnique({
      where: {
        email,
      },
    });

    return user;
  }

  async getUserById(userId: string) {
    const user = this.prisma.tx.user.findUnique({
      where: {
        id: userId,
      },
    });

    return user;
  }

  async createUser(createUserRepository: CreateUserRepository) {
    const data = this.prisma.tx.user.create({
      data: {
        ...createUserRepository,
        lastName: '',
      },
    });

    return data;
  }

  async updateUser(userId: string, data: UpdateUserRepository) {
    const user = this.prisma.tx.user.update({
      where: {
        id: userId,
      },
      data: {
        ...data,
      },
    });

    return user;
  }

  async createManyUserWithDefaultRole(
    data: Prisma.UserCreateInput[],
    defaultRoleId: string,
  ) {
    const users = await this.prisma.tx.user.createManyAndReturn({
      data,
    });

    const userRoles = users.map((user) => ({
      userId: user.id,
      roleId: defaultRoleId,
    }));

    await this.prisma.tx.userRole.createMany({
      data: userRoles,
    });

    return users;
  }

  async getUsersInListEmail(emails: string[]) {
    const users = this.prisma.tx.user.findMany({
      where: {
        email: {
          in: emails,
        },
      },
    });

    return users;
  }
}
