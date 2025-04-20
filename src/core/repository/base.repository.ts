import { Injectable } from '@nestjs/common';
import { Transactional, TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';

@Injectable()
export abstract class BaseRepository<T, C, O> {
  protected readonly modelName: string;
  protected readonly prisma: TransactionHost<TransactionalAdapterPrisma>;

  constructor(txHost: TransactionHost<TransactionalAdapterPrisma>) {
    this.prisma = txHost;
  }

  async create({ data }: { data: C }): Promise<T> {
    return this.prisma.tx[this.modelName].create({
      data,
    });
  }

  async findMany(): Promise<T[]> {
    return this.prisma.tx[this.modelName].findMany();
  }

  async findOne({ options }: { options: O }): Promise<T> {
    return this.prisma.tx[this.modelName].findUnique({
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
    return this.prisma.tx[this.modelName].update({
      where: options,
      data,
    });
  }

  async delete({ options }: { options: O }): Promise<T> {
    return this.prisma.tx[this.modelName].delete({
      where: options,
    });
  }

  @Transactional()
  async transactional<T>(callback: () => Promise<T>): Promise<T> {
    return callback();
  }
}
