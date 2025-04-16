import { AsyncLocalStorage } from 'async_hooks';
import { PrismaService } from '../orm/prisma';
import { TransactionManager } from './transaction-manager';
import { Prisma } from '@prisma/client';

export abstract class BaseRepository<T, C, O> {
  protected readonly modelName: string;
  protected readonly prisma: PrismaService;

  constructor(prisma: PrismaService) {
    this.prisma = prisma;
  }

  protected getPrismaInstance(): Prisma.TransactionClient {
    const transactionManager = TransactionManager.getInstance();
    return transactionManager?.getCurrentTransaction() || this.prisma;
  }

  async create({ data }: { data: C }): Promise<T> {
    const prisma = this.getPrismaInstance();
    return await prisma[this.modelName].create({
      data,
    });
  }

  async findMany(): Promise<T[]> {
    const prisma = this.getPrismaInstance();
    return await prisma[this.modelName].findMany();
  }

  async findOne({ options }: { options: O }): Promise<T> {
    const prisma = this.getPrismaInstance();
    return await prisma[this.modelName].findUnique({
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
    const prisma = this.getPrismaInstance();
    return await prisma[this.modelName].update({
      where: options,
      data,
    });
  }

  async delete({ options }: { options: O }): Promise<T> {
    const prisma = this.getPrismaInstance();
    return await prisma[this.modelName].delete({
      where: options,
    });
  }

  async transaction<U>(callback: () => Promise<U>): Promise<U> {
    const transactionManager = TransactionManager.getInstance();
    return transactionManager.runInTransaction(this.prisma, callback);
  }
}
