import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from 'nestjs-config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OAuthCodeEntity } from '@iac-auth/core/oauth2/oauth-code.entity';
import { ClientEntity } from '@iac-auth/core/oauth2/client.entity';
import { OAuthAccessTokenEntity } from '@iac-auth/core/oauth2/oauth-access-token.entity';
import { OAuthRefreshTokenEntity } from '@iac-auth/core/oauth2/oauth-refresh-token.entity';
import { CypherModule } from '@iac-auth/library/cypher';
import { JwtModule } from '@iac-auth/library/jwt';
import {
  AccessTokenService,
  ClientService,
  RefreshTokenService,
} from '@iac-auth/core/oauth2/modules/common/services';
import {
  AesStrategy,
  JwtStrategy,
} from '@iac-auth/core/oauth2/modules/common/strategies';
import { TOKEN_STRATEGY } from '@iac-auth/contracts/strategies';
import { RuntimeException } from '@nestjs/core/errors/exceptions/runtime.exception';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      OAuthCodeEntity,
      ClientEntity,
      OAuthAccessTokenEntity,
      OAuthRefreshTokenEntity,
    ]),
    CypherModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.get('crypto'),
    }),
    JwtModule,
  ],
  providers: [
    ClientService,
    AccessTokenService,
    RefreshTokenService,
    JwtStrategy,
    AesStrategy,
    {
      provide: TOKEN_STRATEGY,
      inject: [ConfigService, JwtStrategy, AesStrategy],
      useFactory: (
        config: ConfigService,
        jwt: JwtStrategy,
        aes: AesStrategy,
      ) => {
        const strategy = config.get('oauth.accessTokenType');
        switch (strategy) {
          case 'jwt':
            return jwt;
          case 'aes':
            return aes;
          default:
            throw new RuntimeException('Unknown token type');
        }
      },
    },
  ],
  exports: [
    ConfigModule,
    JwtModule,
    CypherModule,
    ClientService,
    AccessTokenService,
    RefreshTokenService,
    TOKEN_STRATEGY,
  ],
})
export class CommonModule {}
