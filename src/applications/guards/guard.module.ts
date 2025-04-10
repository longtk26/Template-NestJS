import { Module } from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { JwtStrategy } from './strategies/jwt/jwt.strategy';
import { AuthGuard } from './auth/auth.guard';

@Module({
  imports: [],
  providers: [
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [JwtStrategy],
})
export class GuardModule {}
