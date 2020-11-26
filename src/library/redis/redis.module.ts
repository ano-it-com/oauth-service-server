import { DynamicModule, Module } from '@nestjs/common';
import {
  RedisModuleAsyncOptions,
  RedisModuleOptions,
} from '@iac-auth/library/redis/index';
import { RedisCoreModule } from '@iac-auth/library/redis/redis-core.module';

@Module({})
export class RedisModule {
  static forRoot(options: RedisModuleOptions): DynamicModule {
    return {
      module: RedisModule,
      imports: [RedisCoreModule.forRoot(options)],
    };
  }

  static forRootAsync(options: RedisModuleAsyncOptions): DynamicModule {
    return {
      module: RedisModule,
      imports: [RedisCoreModule.forRootAsync(options)],
    };
  }
}
