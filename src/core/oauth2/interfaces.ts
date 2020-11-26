import { TokenAuthMethod } from '@iac-auth/core/oauth2/const';
import { OAuthAccessTokenEntity } from '@iac-auth/core/oauth2/oauth-access-token.entity';
import { OAuthRefreshTokenEntity } from '@iac-auth/core/oauth2/oauth-refresh-token.entity';
import { UserEntity } from '@iac-auth/core/users/user.entity';

export type CredentialTuple = [string | null, string | null];

export interface ClientCredentials {
  clientId: string;
  clientSecret: string;
  type: TokenAuthMethod;
}

export interface AccessTokenRequestResponse {
  accessToken: OAuthAccessTokenEntity;
  refreshToken?: OAuthRefreshTokenEntity;
  user?: UserEntity;
  scopes?: string[];
  nonce?: string,
}

export interface AccessTokenResponse {
  token_type: 'Bearer';
  expires_in: number;
  access_token?: string;
  refresh_token?: string;
  id_token?: string;
}

export interface AccessTokenJwtPayload {
  aud: string;
  audience: string;
  jti: string;
  nonce: string;
  exp: number;
  sub: string;
  scopes: string[];
  iss?: string;
}

export interface RefreshTokenData {
  id: string;
  accessTokenId: string;
  expiresAt: number;
}

export interface IdTokenJwtPayload {
  aud: string;
  iat: number;
  nbf: number;
  exp: number;
  sub: string;
  email?: string;
  [key: string]: any;
}

export interface AuthCodeData {
  id: string;
  expiresAt: number;
  codeChallenge?: string;
  codeChallengeMethod?: string;
}

export interface AuthCodeResponse {
  code: string;
  returnTo: string;
  state: string;
}
