import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 1000,
          limit: 1,
        },
      ],
    }),
  ],
})
export class ThrottlerAppModule {}
