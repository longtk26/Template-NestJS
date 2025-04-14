import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { AuthController } from './controller/auth.controller';
import { AuthService } from './service/auth.service';
import { MailModule } from '../mail/mail.module';
import { TokenRepository } from './repository/token.repository';

@Module({
  imports: [UserModule, MailModule],
  controllers: [AuthController],
  providers: [AuthService, TokenRepository],
})
export class AuthModule {}
