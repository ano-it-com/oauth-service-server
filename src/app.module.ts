import {
  forwardRef,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from 'nestjs-config';
import * as path from 'path';
import { RedisModule } from '@iac-auth/library/redis';
import { AuthModule } from '@iac-auth/core/auth';
import { OAuth2Module } from '@iac-auth/core/oauth2/oauth2.module';
import { OpenIdModule } from '@iac-auth/core/open-id';
import { UserModule } from '@iac-auth/core/users';
import csurf from 'csurf';
import { AppController } from '@iac-auth/app.controller';
import { ApiModule } from '@iac-auth/core/api/api.module';
import { ConsoleModule } from 'nestjs-console';
import { CommonModule } from '@iac-auth/core/oauth2/modules';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.load(path.resolve(__dirname, 'config', '**/!(*.d).{ts,js}')),
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => config.get('database'),
      inject: [ConfigService],
      imports: [ConfigModule],
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.get('redis'),
    }),
    AuthModule,
    OAuth2Module,
    OpenIdModule,
    UserModule,
    ApiModule,
    ConsoleModule,
    forwardRef(() => CommonModule),
  ],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer
      .apply(csurf({ cookie: true }))
      .exclude('oauth2/token', 'debug/(.*)', 'api/(.*)')
      .forRoutes('*');
  }
}
