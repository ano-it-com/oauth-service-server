import { OAuthService } from '@iac-auth/core/oauth2/services/oauth.service';
import { Request } from 'express';
import { TokenDto } from '@iac-auth/core/oauth2/dto';
import { OAuthException } from '@iac-auth/core/oauth2/exceptions';
import {
  AccessTokenJwtPayload,
  AccessTokenResponse,
  RefreshTokenData,
} from '@iac-auth/core/oauth2/interfaces';
import { toEpochSeconds } from '@iac-auth/utils/date.utility';
import {
  grantsWithIdToken,
  Scopes,
  TokenType,
} from '@iac-auth/core/oauth2/const';
import { OAuthAccessTokenEntity } from '@iac-auth/core/oauth2/oauth-access-token.entity';
import { OAuthRefreshTokenEntity } from '@iac-auth/core/oauth2/oauth-refresh-token.entity';
import { LessThan } from 'typeorm';

export class TokenService extends OAuthService {
  public async respondToAccessTokenRequest(
    request: Request,
    body: TokenDto,
  ): Promise<any> {
    const grant = this.grants.find(
      grant => grant.getIdentifier() === body.grant_type,
    );
    if (!grant) {
      this.logger.warn(`Unknown grant ${body.grant_type}`);
      throw OAuthException.unsupportedGrantType();
    }

    const {
      accessToken,
      user,
      refreshToken,
      scopes,
      nonce,
    } = await grant.respondToAccessTokenRequest(request, body);

    const response: AccessTokenResponse = {
      token_type: 'Bearer',
      expires_in: toEpochSeconds(accessToken.expiresAt.getTime() - Date.now()),
      access_token: await this.tokenStrategy.sign(accessToken.toPayload()),
    };

    if (refreshToken) {
      response.refresh_token = this.cypherService.encrypt(
        refreshToken.toPayload(),
      );
    }

    if (this.shouldIssueIdToken(body, scopes) && user) {
      response.id_token = await this.jwtService.sign(
        {
          aud: accessToken.clientId,
          nonce,
          exp: toEpochSeconds(accessToken.expiresAt),
          sub: user.id,
          iss: this.config.get('application.url'),
          ...(accessToken.scopes.includes('email') && { email: user.email }),
          ...(accessToken.scopes.includes('profile') &&
            user.toOpenIdProfile(body.scopes as Scopes[])),
        },
        'id_token',
      );
    }

    return response;
  }

  protected shouldIssueIdToken(body: TokenDto, scopes?: string[]): boolean {
    if (scopes)
      return (
        scopes.includes('openid') && grantsWithIdToken.includes(body.grant_type)
      );
    return (
      body.scopes.includes('openid') &&
      grantsWithIdToken.includes(body.grant_type)
    );
  }

  public async decryptToken(encrypted: string, hint?: TokenType): Promise<any> {
    let decoded: AccessTokenJwtPayload | RefreshTokenData;

    try {
      decoded = await this.tokenStrategy.verify(encrypted);
    } catch (e) {
      decoded = this.decryptCypher(encrypted);
      if (decoded) {
        hint = TokenType.refresh_token;
      }
    }

    if (!decoded) {
      return { accessToken: null, decoded: null, refreshToken: null };
    }

    let token: OAuthAccessTokenEntity | OAuthRefreshTokenEntity;

    if (hint) {
      switch (hint) {
        case TokenType.access_token:
          if ('jti' in decoded) {
            token = await this.accessTokenRepository.findOne(
              {
                id: decoded.jti,
                revoked: false,
              },
              { relations: ['user'] },
            );
          }
          break;
        case TokenType.refresh_token:
          if ('id' in decoded) {
            token = await this.refreshTokenRepository.findOne({
              id: decoded.id,
              revoked: false,
            });
          }
          break;
      }
    } else if (isAccessTokenPayload(decoded)) {
      if ('jti' in decoded) {
        token = await this.accessTokenRepository.findOne(
          {
            id: decoded.jti,
            revoked: false,
          },
          { relations: ['user'] },
        );
      }
    } else {
      token = await this.refreshTokenRepository.findOne({
        id: decoded.id,
        revoked: false,
      });
    }

    return {
      token,
      decoded,
      isAccessToken: isAccessTokenPayload(decoded),
    };
  }

  public async verifyToken(encrypted: string, hint?: TokenType): Promise<any> {
    const { isAccessToken, decoded, token } = await this.decryptToken(
      encrypted,
      hint,
    );
    if (!decoded) return { active: false };

    if (isAccessToken) {
      const accessToken = token as OAuthAccessTokenEntity;
      const payload = decoded as AccessTokenJwtPayload;

      const expired = payload.exp * 1000 < Date.now();
      const active =
        !!accessToken &&
        !expired &&
        payload.iss === this.config.get('application.url') &&
        !accessToken.revoked;

      return {
        active,
        scope: accessToken && accessToken.scopes.join(' '),
        client_id: accessToken && accessToken.clientId,
        username: accessToken && (await accessToken.user).email,
        exp: payload.exp,
      };
    } else {
      const refreshToken = token as OAuthRefreshTokenEntity;
      const payload = decoded as RefreshTokenData;

      const expired = payload.expiresAt * 1000 < Date.now();
      const active = !!refreshToken && !expired && !refreshToken.revoked;

      return {
        active,
        exp: payload.expiresAt,
        client_id: refreshToken.accessToken.clientId,
      };
    }
  }

  public async revokeToken(
    token: OAuthAccessTokenEntity | OAuthRefreshTokenEntity,
  ): Promise<boolean> {
    token.revoked = true;
    token.revokedAt = new Date();

    if (isAccessToken(token)) {
      await this.accessTokenRepository.save(token);
    } else {
      await this.refreshTokenRepository.save(token);
    }

    return true;
  }

  protected decryptCypher(token: string): any {
    try {
      return this.cypherService.decrypt(token);
    } catch (e) {
      return false;
    }
  }

  public async activeCount(): Promise<number> {
    return this.accessTokenRepository.count({
      revoked: false,
      expiresAt: LessThan(new Date()),
    });
  }
}

function isAccessTokenPayload(
  decoded: AccessTokenJwtPayload | RefreshTokenData,
): decoded is AccessTokenJwtPayload {
  return !decoded.hasOwnProperty('accessTokenId');
}

function isAccessToken(
  token: OAuthAccessTokenEntity | OAuthRefreshTokenEntity,
): token is OAuthAccessTokenEntity {
  return !token.hasOwnProperty('accessTokenId');
}
