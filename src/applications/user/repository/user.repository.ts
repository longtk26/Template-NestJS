import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { PrismaService } from 'src/core/orm/prisma';
import { CreateUserRepository, UpdateUserRepository } from '../types/user.types';

@Injectable()
export class UserRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(UserRepository.name);
  }

  async getUserByEmail(email: string) {
    const user = this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    return user;
  }

  async getUserById(userId: string) {
    const user = this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });

    return user;
  }

  async createUser(createUserRepository: CreateUserRepository) {
    const data = this.prismaService.user.create({
      data: {
        ...createUserRepository,
      },
    });

    return data;
  }

  async updateUser(userId: string, data: UpdateUserRepository) {
    const user = this.prismaService.user.update({
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
