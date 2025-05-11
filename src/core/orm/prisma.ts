import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(private readonly logger: PinoLogger) {
    super({});
    this.logger.setContext(PrismaService.name);
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.info('==🚀Database connected==');
    } catch (error) {
      this.logger.error(error, '❌Error connecting to the database');
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.info('==🚀Database disconnected==');
  }
}
