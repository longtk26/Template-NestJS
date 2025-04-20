import { Global, Module, Req } from '@nestjs/common';
import { PrismaService } from './prisma';
import { ClsService } from 'nestjs-cls';

@Global()
@Module({
  imports: [],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
