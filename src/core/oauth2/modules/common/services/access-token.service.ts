import { BaseTokenService } from '@iac-auth/contracts/service/base-token.service';
import { OAuthAccessTokenEntity } from '@iac-auth/core/oauth2/oauth-access-token.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GrantTypes } from '@iac-auth/core/oauth2/const';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AccessTokenService extends BaseTokenService<
  OAuthAccessTokenEntity
> {
  constructor(
    @InjectRepository(OAuthAccessTokenEntity)
    protected readonly repository: Repository<OAuthAccessTokenEntity>,
  ) {
    super(repository);
  }

  create(
    repo = this.repository,
    clientId: string,
    userId: string | null,
    scopes: string[],
    grantType: GrantTypes,
    ttl: number,
  ): Promise<OAuthAccessTokenEntity> {
    const accessToken = repo.create({
      clientId,
      userId,
      scopes,
      revoked: false,
      grantType,
      expiresAt: this.getExpiration(ttl),
    });

    return repo.save(accessToken);
  }
}
