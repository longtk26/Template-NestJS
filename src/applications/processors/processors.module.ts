import { Module } from '@nestjs/common';
import { MailProcessor } from './mail.processors';
import { TranslateProcessor } from './translate.processors';

@Module({
  providers: [MailProcessor, TranslateProcessor],
})
export class ProcessorsModule {}
