import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { Role as PrismaRole, Prisma } from '@prisma/client';
import { BaseRepository } from 'src/core/repository/base.repository';

@Injectable()
export class RoleRepository extends BaseRepository<
  PrismaRole,
  Prisma.RoleCreateInput,
  Prisma.RoleWhereInput
> {
  protected readonly modelName = 'role';
  constructor(txHost: TransactionHost<TransactionalAdapterPrisma>) {
    super(txHost);
  }

  //  Other methods can be added here as needed
  async findByName(name: string) {
    return await this.prisma.tx.role.findUnique({
      where: { name },
    });
  }

  async getRoleNamesByUserId(userId: string) {
    const userRoles = await this.prisma.tx.userRole.findMany({
      where: {
        userId,
      },
      include: {
        role: true,
      },
    });

    if (userRoles.length === 0) {
      return [];
    }

    return userRoles.map((ur) => ur.role.name);
  }
}
