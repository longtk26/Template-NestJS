import { Module } from '@nestjs/common';
import { RedisClient } from './redis';
import { CacheModule } from '@nestjs/cache-manager';
import Keyv from 'keyv';
import KeyvRedis from '@keyv/redis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import { RedisConfig } from 'src/config/interface';
import { ConfigEnum } from 'src/config/config';
import { redisProvider, redlockProvider } from './redis.provider';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService, logger: PinoLogger) => {
        const keyvRedis = new KeyvRedis(
          config.get<RedisConfig>(ConfigEnum.REDIS_CONFIG).redisUri,
        );
        const keyv = new Keyv({
          store: keyvRedis,
        });

        keyv.on('error', (err) => {
          logger.error(err, '❌ Redis connection error');
          return process.exit(1);
        });

        return { stores: [keyv] };
      },
      inject: [ConfigService, PinoLogger],
    }),
  ],
  providers: [RedisClient, redisProvider, redlockProvider],
  exports: [RedisClient, redisProvider, redlockProvider],
})
export class RedisModule {}
