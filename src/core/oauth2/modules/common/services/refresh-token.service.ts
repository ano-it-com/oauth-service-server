import { BaseTokenService } from '@iac-auth/contracts/service/base-token.service';
import { OAuthRefreshTokenEntity } from '@iac-auth/core/oauth2/oauth-refresh-token.entity';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CypherService } from '@iac-auth/library/cypher';
import { RefreshTokenData } from '@iac-auth/core/oauth2/interfaces';
import { OAuthException } from '@iac-auth/core/oauth2/exceptions';

@Injectable()
export class RefreshTokenService extends BaseTokenService<
  OAuthRefreshTokenEntity
> {
  constructor(
    @InjectRepository(OAuthRefreshTokenEntity)
    protected readonly repository: Repository<OAuthRefreshTokenEntity>,
    private readonly cypherService: CypherService,
  ) {
    super(repository);
  }

  public create(
    repo = this.repository,
    accessTokenId: string,
    ttl: number,
    overrideExpiration?: Date,
  ): Promise<OAuthRefreshTokenEntity> {
    const accessToken = repo.create({
      accessTokenId,
      revoked: false,
      expiresAt: overrideExpiration || this.getExpiration(ttl),
    });

    return repo.save(accessToken);
  }

  public async getFromToken(token: string): Promise<OAuthRefreshTokenEntity> {
    let refreshTokenData: RefreshTokenData;

    try {
      refreshTokenData = this.cypherService.decrypt(token);
    } catch (e) {
      this.logger.error(`Cannot decrypt refresh token: ${e.message}`, e.stack);
      throw OAuthException.invalidRefreshToken();
    }

    if (refreshTokenData.expiresAt * 1000 < Date.now()) {
      this.logger.warn(`Refresh token ${refreshTokenData.id} expired`);
      throw OAuthException.invalidRefreshToken('Token expired');
    }

    const refreshToken = await this.repository.findOne(refreshTokenData.id);
    if (!refreshToken) {
      this.logger.warn(`Refresh token ${refreshTokenData.id} not found`);
      throw OAuthException.invalidRequest('refresh_token');
    }

    if (refreshToken.revoked) {
      this.logger.warn(`Refresh token ${refreshToken.id} revoked`);
      throw OAuthException.invalidRefreshToken('Token revoked');
    }

    return refreshToken;
  }
}
