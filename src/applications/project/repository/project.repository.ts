import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Prisma, Project as PrismaProject } from '@prisma/client';
import { BaseRepository } from 'src/core/repository/base.repository';

export class ProjectRepository extends BaseRepository<
  PrismaProject,
  Prisma.XOR<Prisma.ProjectCreateInput, Prisma.ProjectUncheckedCreateInput>,
  Prisma.ProjectWhereInput
> {
  protected readonly modelName: string = 'project';

  constructor(txHost: TransactionHost<TransactionalAdapterPrisma>) {
    super(txHost);
  }
}
