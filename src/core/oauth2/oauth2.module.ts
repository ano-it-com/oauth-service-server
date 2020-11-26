import { Module } from '@nestjs/common';
import { CommonModule } from '@iac-auth/core/oauth2/modules/common';
import {
  AuthorizationCodeModule,
  ClientCredentialsModule,
  PasswordModule,
  RefreshTokenModule,
} from '@iac-auth/core/oauth2/modules';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OAuthAccessTokenEntity } from '@iac-auth/core/oauth2/oauth-access-token.entity';
import { OAuthRefreshTokenEntity } from '@iac-auth/core/oauth2/oauth-refresh-token.entity';
import { ClientEntity } from '@iac-auth/core/oauth2/client.entity';
import { CodeService, TokenService } from '@iac-auth/core/oauth2/services';
import {
  AuthorizationController,
  DebugController,
  TokenController,
} from '@iac-auth/core/oauth2/controllers';
import { CypherModule } from '@iac-auth/library/cypher';
import { ConfigModule, ConfigService } from 'nestjs-config';
import { KeyEntity } from '@iac-auth/core/oauth2/key.entity';

@Module({
  imports: [
    CommonModule,
    ClientCredentialsModule,
    PasswordModule,
    RefreshTokenModule,
    AuthorizationCodeModule,
    TypeOrmModule.forFeature([
      OAuthAccessTokenEntity,
      OAuthRefreshTokenEntity,
      ClientEntity,
      KeyEntity,
    ]),
    CypherModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.get('crypto'),
    }),
  ],
  providers: [TokenService, CodeService],
  controllers: [TokenController, AuthorizationController, DebugController],
  exports: [TokenService],
})
export class OAuth2Module {}
