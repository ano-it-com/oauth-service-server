import { GrantInterface } from '@iac-auth/core/oauth2/modules/common/grant.interface';
import { Inject, Logger } from '@nestjs/common';
import { ConfigService } from 'nestjs-config';
import { Connection, EntityManager, Repository } from 'typeorm';
import { getConnectionToken } from '@nestjs/typeorm';
import {
  AccessTokenService,
  ClientService,
  RefreshTokenService,
} from '@iac-auth/core/oauth2/modules/common/services';
import { AuthorizationDto, TokenDto } from '@iac-auth/core/oauth2/dto';
import { AccessTokenRequestResponse } from '@iac-auth/core/oauth2/interfaces';
import { AuthenticationRequest } from '@iac-auth/core/oauth2/authentication.request';
import { OAuthCodeEntity } from '@iac-auth/core/oauth2/oauth-code.entity';
import { ClientEntity } from '@iac-auth/core/oauth2/client.entity';
import { OAuthAccessTokenEntity } from '@iac-auth/core/oauth2/oauth-access-token.entity';
import { OAuthRefreshTokenEntity } from '@iac-auth/core/oauth2/oauth-refresh-token.entity';
import { OAuthException } from '@iac-auth/core/oauth2/exceptions';
import { Request } from 'express';
import {
  grantsWithRefreshToken,
  GrantTypes,
} from '@iac-auth/core/oauth2/const';
import { UserEntity } from '@iac-auth/core/users/user.entity';

export abstract class AbstractGrant implements GrantInterface {
  public readonly logger = new Logger(this.constructor.name);

  @Inject()
  protected readonly config: ConfigService;

  @Inject(getConnectionToken())
  protected readonly connection: Connection;

  @Inject(ClientService)
  protected readonly clientService: ClientService;

  @Inject(AccessTokenService)
  protected readonly accessTokenService: AccessTokenService;

  @Inject(RefreshTokenService)
  protected readonly refreshTokenService: RefreshTokenService;

  getIdentifier(): GrantTypes {
    return null;
  }

  abstract respondToAccessTokenRequest(
    req: Request,
    body: TokenDto,
  ): Promise<AccessTokenRequestResponse>;

  createAuthRequest(data: AuthorizationDto): Promise<AuthenticationRequest> {
    throw new Error('This grant cannot create an authorization request');
  }

  completeAuthRequest(
    authRequest: AuthenticationRequest,
  ): Promise<OAuthCodeEntity> {
    throw new Error('This grant cannot complete an authorization request');
  }

  canRespondToAuthorizationRequest(query: Record<string, any>): boolean {
    return false;
  }

  async issueAccessToken(
    client: ClientEntity,
    userId: string | null,
    scopes: string[],
    repo?: Repository<OAuthAccessTokenEntity>,
  ): Promise<OAuthAccessTokenEntity> {
    return this.accessTokenService.create(
      repo,
      client.id,
      userId,
      scopes,
      this.getIdentifier(),
      this.config.get('oauth.accessTokenTTL'),
    );
  }

  async issueRefreshToken(
    accessToken: OAuthAccessTokenEntity,
    overrideExpiration?: Date,
    repo?: Repository<OAuthRefreshTokenEntity>,
  ): Promise<OAuthRefreshTokenEntity> {
    return this.refreshTokenService.create(
      repo,
      accessToken.id,
      this.config.get('oauth.refreshTokenTTL'),
      overrideExpiration,
    );
  }

  protected validateScope(
    client: ClientEntity,
    scopes: string[] = [],
  ): string[] {
    scopes
      .filter(s => s.split(':').length < 2)
      .forEach(plainScope => {
        if (!client.canIssueScope(plainScope)) {
          this.logger.warn(
            `Client ${client.id} cannot issue scope ${plainScope}`,
          );
          throw OAuthException.invalidScope(plainScope);
        }
      });

    return scopes;
  }

  protected async getClient(
    body: { client_id: string; client_secret?: string },
    req?: Request,
    validateClient = true,
  ): Promise<ClientEntity> {
    const client =
      req?.client ||
      (await this.clientService.getClient(
        this.clientService.getClientCredentials(body, req?.headers),
        validateClient,
      ));

    if (!client.canHandleGrant(this.getIdentifier())) {
      this.logger.warn(
        `Client ${client.id} cannot handle grant ${this.getIdentifier()}`,
      );
      throw OAuthException.unauthorizedClient();
    }
    return client;
  }

  protected shouldIssueRefreshToken(
    body: TokenDto,
    scopes?: string[],
  ): boolean {
    if (scopes) {
      return (
        scopes.includes('offline_access') &&
        grantsWithRefreshToken.includes(body.grant_type)
      );
    }
    return (
      body.scopes.includes('offline_access') &&
      grantsWithRefreshToken.includes(body.grant_type)
    );
  }

  protected async returnAccessTokenResponse({
    em,
    user,
    client,
    body,
    scopes,
  }: {
    em: EntityManager;
    user?: UserEntity;
    client: ClientEntity;
    body: TokenDto;
    scopes?: string[];
  }): Promise<AccessTokenRequestResponse> {
    const accessTokenRepo = em.getRepository(OAuthAccessTokenEntity);
    const accessToken = await this.issueAccessToken(
      client,
      user?.id || null,
      this.validateScope(client, scopes || body.scopes),
      accessTokenRepo,
    );

    const response: AccessTokenRequestResponse = {
      accessToken,
      user,
    };

    if (this.shouldIssueRefreshToken(body)) {
      const refreshTokenRepo = em.getRepository(OAuthRefreshTokenEntity);
      response.refreshToken = await this.issueRefreshToken(
        accessToken,
        null,
        refreshTokenRepo,
      );
    }

    return response;
  }
}
