import { GrantTypes } from '@iac-auth/core/oauth2/const';
import { Request } from 'express';
import { AuthorizationDto, TokenDto } from '@iac-auth/core/oauth2/dto';
import { AccessTokenRequestResponse } from '@iac-auth/core/oauth2/interfaces';
import { ClientEntity } from '@iac-auth/core/oauth2/client.entity';
import { OAuthAccessTokenEntity } from '@iac-auth/core/oauth2/oauth-access-token.entity';
import { OAuthRefreshTokenEntity } from '@iac-auth/core/oauth2/oauth-refresh-token.entity';
import { AuthenticationRequest } from '@iac-auth/core/oauth2/authentication.request';
import { OAuthCodeEntity } from '@iac-auth/core/oauth2/oauth-code.entity';

export interface GrantInterface {
  getIdentifier(): GrantTypes;

  canRespondToAuthorizationRequest(query: Record<string, any>): boolean;

  respondToAccessTokenRequest(
    req: Request,
    body: TokenDto,
  ): Promise<AccessTokenRequestResponse>;

  issueAccessToken(
    client: ClientEntity,
    userId: string | null,
    scopes: string[],
  ): Promise<OAuthAccessTokenEntity>;

  issueRefreshToken(
    accessToken: OAuthAccessTokenEntity,
  ): Promise<OAuthRefreshTokenEntity>;

  createAuthRequest(data: AuthorizationDto): Promise<AuthenticationRequest>;

  completeAuthRequest(
    authRequest: AuthenticationRequest,
  ): Promise<OAuthCodeEntity>;
}
