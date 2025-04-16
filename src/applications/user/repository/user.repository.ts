import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { PrismaService } from 'src/core/orm/prisma';
import {
  CreateUserRepository,
  UpdateUserRepository,
} from '../types/user.types';
import { BaseRepository } from 'src/core/repository/base.repository';
import { Prisma, User as PrismaUser } from '@prisma/client';

@Injectable()
export class UserRepository extends BaseRepository<
  PrismaUser,
  Prisma.XOR<Prisma.UserCreateInput, Prisma.UserUncheckedCreateInput>,
  Prisma.UserWhereInput
> {
  protected readonly modelName: string = 'user';
  constructor(
    private readonly prismaService: PrismaService,
    private readonly logger: PinoLogger,
  ) {
    super(prismaService);
  }

  async getUserByEmail(email: string) {
    const user = this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    return user;
  }

  async getUserById(userId: string) {
    const user = this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    return user;
  }

  async createUser(createUserRepository: CreateUserRepository) {
    const data = this.prisma.user.create({
      data: {
        ...createUserRepository,
      },
    });

    return data;
  }

  async updateUser(userId: string, data: UpdateUserRepository) {
    const prisma = await this.getPrismaInstance();
    const user = prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...data,
      },
    });

    return user;
  }
}
