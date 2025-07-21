import { Module } from '@nestjs/common';
import { TranslateCronjob } from './translate.cronjob';
import { ScheduleModule } from '@nestjs/schedule';
import { SSEModule } from '../sse/sse.module';

@Module({
  imports: [ScheduleModule.forRoot(), SSEModule],
  providers: [TranslateCronjob],
  exports: [TranslateCronjob],
})
export class CronjobModule {}
