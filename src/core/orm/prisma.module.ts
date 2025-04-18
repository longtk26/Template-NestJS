import { Global, Module, Req } from '@nestjs/common';
import { PrismaService } from './prisma';
import { PrismaClientManager } from './prisma-client-manager';
import { ClsService } from 'nestjs-cls';
import { RequestContextModule } from '../cls/cls.module';

@Global()
@Module({
  imports: [RequestContextModule],
  providers: [PrismaService, PrismaClientManager],
  exports: [PrismaService, PrismaClientManager],
})
export class PrismaModule {}
