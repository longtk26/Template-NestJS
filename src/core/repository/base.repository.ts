import { Injectable } from '@nestjs/common';
import { PrismaService } from '../orm/prisma';
import { PrismaClientManager } from '../orm/prisma-client-manager';
import { Prisma } from '@prisma/client';

@Injectable()
export abstract class BaseRepository<T, C, O> {
  protected readonly modelName: string;
  protected readonly prisma: Prisma.TransactionClient | PrismaService;

  constructor(protected readonly prismaClientManager: PrismaClientManager) {
    this.prisma = this.prismaClientManager.getClient();
  }

  async create({ data }: { data: C }): Promise<T> {
    return await this.prisma[this.modelName].create({
      data,
    });
  }

  async findMany(): Promise<T[]> {
    return await this.prisma[this.modelName].findMany();
  }

  async findOne({ options }: { options: O }): Promise<T> {
    return await this.prisma[this.modelName].findUnique({
      where: options,
    });
  }

  async update({
    data,
    options,
  }: {
    data: Partial<T>;
    options: O;
  }): Promise<T> {
    return await this.prisma[this.modelName].update({
      where: options,
      data,
    });
  }

  async delete({ options }: { options: O }): Promise<T> {
    return await this.prisma[this.modelName].delete({
      where: options,
    });
  }
}
