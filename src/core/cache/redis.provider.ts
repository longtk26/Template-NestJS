// redis.provider.ts
import Redis from 'ioredis';
import Redlock from 'redlock';
import { ConfigService } from '@nestjs/config';

export const redisProvider = {
  provide: 'REDIS_CLIENT',
  useFactory: (configService: ConfigService) => {
    return new Redis(configService.get('REDIS_URI'));
  },
  inject: [ConfigService],
};

export const redlockProvider = {
  provide: 'REDLOCK',
  useFactory: (redisClient: any) => {
    return new Redlock([redisClient], {
      retryCount: 5,
      retryDelay: 200,
    });
  },
  inject: ['REDIS_CLIENT'],
};
