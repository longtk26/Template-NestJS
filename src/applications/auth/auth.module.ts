import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { AuthController } from './controller/auth.controller';
import { AuthService } from './service/auth.service';
import { MailModule } from '../mail/mail.module';
import { TokenRepository } from './repository/token.repository';
import { PrismaModule } from 'src/core/orm/prisma.module';

@Module({
  imports: [UserModule, MailModule],
  controllers: [AuthController],
  providers: [AuthService, TokenRepository],
})
export class AuthModule {}
