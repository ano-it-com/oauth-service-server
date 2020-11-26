import { AbstractGrant } from '@iac-auth/core/oauth2/modules/common';
import { AccessTokenRequestResponse } from '@iac-auth/core/oauth2/interfaces';
import { TokenDto } from '@iac-auth/core/oauth2/dto';
import { Request } from 'express';
import { OAuthException } from '@iac-auth/core/oauth2/exceptions';
import { OAuthAccessTokenEntity } from '@iac-auth/core/oauth2/oauth-access-token.entity';
import { OAuthRefreshTokenEntity } from '@iac-auth/core/oauth2/oauth-refresh-token.entity';

export class RefreshTokenServiceGrant extends AbstractGrant {
  async respondToAccessTokenRequest(
    req: Request,
    body: TokenDto,
  ): Promise<AccessTokenRequestResponse> {
    const client = await this.getClient(body, req);
    const scopes = this.validateScope(client, body.scopes);
    const oldRefreshToken = await this.refreshTokenService.getFromToken(
      body.refresh_token,
    );
    const oldAccessToken = oldRefreshToken.accessToken;

    if (client.id !== oldAccessToken.clientId) {
      this.logger.warn(
        `Provided client ${client.id} does not match the accessToken ${oldAccessToken.id} client`,
      );
      throw OAuthException.invalidClient();
    }

    scopes.forEach(scope => {
      if (!oldAccessToken.scopes.includes(scope)) {
        this.logger.warn(`Requested unauthorized scope ${scope}`);
        throw OAuthException.invalidScope(scope);
      }
    });

    return this.connection.transaction(async em => {
      const accessTokenRepo = em.getRepository(OAuthAccessTokenEntity);
      const refreshTokenRepo = em.getRepository(OAuthRefreshTokenEntity);

      const accessToken = await this.issueAccessToken(
        client,
        oldAccessToken.userId,
        scopes,
        accessTokenRepo,
      );
      const refreshToken = await this.issueRefreshToken(
        accessToken,
        oldRefreshToken.expiresAt,
        refreshTokenRepo,
      );

      await this.accessTokenService.revoke(accessTokenRepo, oldAccessToken);
      await this.refreshTokenService.revoke(refreshTokenRepo, oldRefreshToken);

      return {
        accessToken,
        refreshToken,
        user: await accessToken.user,
      };
    });
  }
}
