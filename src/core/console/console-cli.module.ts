import path from 'path';

import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from 'nestjs-config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@iac-auth/core/users/user.entity';
import { ClientEntity } from '@iac-auth/core/oauth2/client.entity';
import { UserCliService } from '@iac-auth/core/console/services';
import { ConsoleModule } from 'nestjs-console';
import { UserModule } from '@iac-auth/core/users';
import { OAuthCodeEntity } from '@iac-auth/core/oauth2/oauth-code.entity';
import { OAuthAccessTokenEntity } from '@iac-auth/core/oauth2/oauth-access-token.entity';
import { OAuthRefreshTokenEntity } from '@iac-auth/core/oauth2/oauth-refresh-token.entity';
import { PermissionEntity, RoleEntity } from '@iac-auth/core/rb';
import { KeyEntity } from '@iac-auth/core/oauth2/key.entity';

const CLI_ENTITIES = [
  UserEntity, ClientEntity, OAuthCodeEntity,
  OAuthAccessTokenEntity, OAuthRefreshTokenEntity,
  RoleEntity, PermissionEntity, KeyEntity
];

@Module({
  imports: [
    ConfigModule.load(path.resolve(__dirname, '../../config', '**/!(*.d).{ts,js}')),
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        ...config.get('database'),
        entities: CLI_ENTITIES,
      }),
      inject: [ConfigService],
      imports: [ConfigModule],
    }),
    TypeOrmModule.forFeature(CLI_ENTITIES),
    UserModule,
    ConsoleModule,
  ],
  providers: [
    UserCliService,
  ]
})
export class ConsoleCliModule {}
