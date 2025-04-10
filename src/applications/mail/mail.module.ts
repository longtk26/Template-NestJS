import { Module } from '@nestjs/common';
import { MailService } from './service/mail.service';

@Module({
  imports: [],
  exports: [MailService],
  providers: [MailService],
})
export class MailModule {}
