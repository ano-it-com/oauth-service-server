import { RedisOptions } from 'ioredis';
import { ModuleMetadata, Type } from '@nestjs/common/interfaces';

export const DEFAULT_REDIS_CONNECTION = 'redisDefaultConnection';
export const REDIS_CONNECTION_NAME = 'REDIS_CONNECTION_NAME';
export const REDIS_MODULE_OPTIONS = 'REDIS_MODULE_OPTIONS';

export interface RedisModuleOptions {
  ioredis?: RedisOptions;
  url?: string;
  connectionName?: string;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface RedisOptionsFactory {
  createRedisOptions(
    connectionName?: string,
  ): Promise<RedisModuleOptions> | RedisModuleOptions;
}

export interface RedisModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  connectionName?: string;
  useExisting?: Type<RedisOptionsFactory>;
  useClass?: Type<RedisOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<RedisModuleOptions> | RedisModuleOptions;
  inject?: any[];
}

export * from './redis.module';
export * from './redis-core.module';
