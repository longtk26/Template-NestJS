import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
@Injectable()
export class RedisClient {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  public async set(key: string, value: any, ttl?: number) {
    return await this.cacheManager.set(key, value, ttl);
  }

  public async get(key: string) {
    return await this.cacheManager.get(key);
  }

  public async del(key: string) {
    return await this.cacheManager.del(key);
  }
}
