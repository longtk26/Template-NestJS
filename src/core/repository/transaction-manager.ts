import { AsyncLocalStorage } from 'node:async_hooks';
import { PrismaService } from '../orm/prisma';
import { Prisma } from '@prisma/client';

export class TransactionManager {
  private static instance: TransactionManager;
  private asyncLocalStorage: AsyncLocalStorage<Prisma.TransactionClient>;

  private constructor() {
    this.asyncLocalStorage = new AsyncLocalStorage<PrismaService>();
  }

  static getInstance(): TransactionManager {
    if (!TransactionManager.instance) {
      TransactionManager.instance = new TransactionManager();
    }
    return TransactionManager.instance;
  }

  getCurrentTransaction(): Prisma.TransactionClient | null {
    return this.asyncLocalStorage.getStore() || null;
  }

  async runInTransaction<T>(
    prisma: PrismaService,
    callback: () => Promise<T>,
  ): Promise<T> {
    return prisma.$transaction(async (tx) => {
      return this.asyncLocalStorage.run(tx, callback);
    });
  }
}
