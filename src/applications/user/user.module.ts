import { Module } from '@nestjs/common';
import { UserController } from './controller/user.controller';
import { UserService } from './service/user.service';
import { RedisModule } from 'src/core/cache/redis.module';
import { WorkerModule } from 'src/worker/worker.module';
import { UserRepository } from './repository/user.repository';
import { ConfigModule } from '@nestjs/config';
import { SecurityModule } from 'src/core/security/security.module';
import { PrismaModule } from 'src/core/orm/prisma.module';

@Module({
  imports: [
    RedisModule,
    WorkerModule,
    ConfigModule,
    SecurityModule,
    PrismaModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService, UserRepository],
})
export class UserModule {}
