import { Injectable } from '@nestjs/common';
import { Prisma, Token as PrismaToken, TokenType } from '@prisma/client';
import dayjs from 'dayjs';
import { PrismaService } from 'src/core/orm/prisma';
import { BaseRepository } from 'src/core/repository/base.repository';
import utc from 'dayjs/plugin/utc';
import { PinoLogger } from 'nestjs-pino';
dayjs.extend(utc);

@Injectable()
export class TokenRepository extends BaseRepository<
  PrismaToken,
  Prisma.TokenCreateInput,
  Prisma.TokenWhereInput
> {
  protected readonly modelName: string = 'token';
  protected readonly prisma: PrismaService;
  constructor(protected readonly prismaService: PrismaService) {
    super();
    this.prisma = prismaService;
  }

  async findTokenByToken(token: string) {
    console.log(`current day is ${dayjs().utc()}`);
    console.log(`token is ${token}`);
    return await this.prisma.token.findUnique({
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
