import { Injectable } from '@nestjs/common';
import { Prisma, Token as PrismaToken, TokenType } from '@prisma/client';
import dayjs from 'dayjs';
import { BaseRepository } from 'src/core/repository/base.repository';
import utc from 'dayjs/plugin/utc';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
dayjs.extend(utc);

@Injectable()
export class TokenRepository extends BaseRepository<
  PrismaToken,
  Prisma.TokenCreateInput,
  Prisma.TokenWhereInput
> {
  protected readonly modelName: string = 'token';
  constructor(txHost: TransactionHost<TransactionalAdapterPrisma>) {
    super(txHost);
  }

  async findTokenByToken(token: string) {
    return this.prisma.tx.token.findUnique({
      where: {
        token,
        type: TokenType.RESET_PASSWORD,
        expiredAt: {
          gte: dayjs().utc().format(),
        },
      },
      include: {
        user: true,
      },
    });
  }
}
