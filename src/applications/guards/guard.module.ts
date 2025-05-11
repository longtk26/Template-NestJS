import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtStrategy } from './strategies/jwt/jwt.strategy';
import { GlobalAuthGuard } from './auth/global-auth.guard';
import { ThrottlerAppModule } from './throttler/throttler.module';
import { ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [ThrottlerAppModule],
  providers: [
    JwtStrategy,

    {
      provide: APP_GUARD,
      useClass: GlobalAuthGuard,
    },
  ],
  exports: [JwtStrategy],
})
export class GuardModule {}
