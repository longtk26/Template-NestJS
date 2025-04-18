import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class RequestContext {
  constructor(
    // We can inject the provided ClsService instance,
    private readonly cls: ClsService,
  ) {}

  get<T>(key: string): T | undefined {
    console.log('get', key);
    return this.cls.get(key);
  }

  set<T>(key: string, value: T): void {
    console.log('set', key);
    this.cls.set(key, value);
  }

  clear(key: string): void {
    this.cls.set(key, undefined);
  }
}
