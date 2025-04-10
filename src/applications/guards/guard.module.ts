import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtStrategy } from './strategies/jwt/jwt.strategy';
import { GlobalAuthGuard } from './auth/global-auth.guard';

@Module({
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
