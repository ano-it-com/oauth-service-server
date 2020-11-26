import { BaseToken } from '@iac-auth/contracts/entity/base-token.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { OAuthAccessTokenEntity } from '@iac-auth/core/oauth2/oauth-access-token.entity';
import { RefreshTokenData } from '@iac-auth/core/oauth2/interfaces';
import { toEpochSeconds } from '@iac-auth/utils/date.utility';

@Entity({ name: 'oauth-refresh-tokens' })
export class OAuthRefreshTokenEntity extends BaseToken {
  @Column({ type: 'uuid' })
  accessTokenId: string;

  @ManyToOne(type => OAuthAccessTokenEntity, {
    eager: true,
    onDelete: 'CASCADE',
  })
  accessToken: OAuthAccessTokenEntity;

  public toPayload(): RefreshTokenData {
    return {
      id: this.id,
      accessTokenId: this.accessTokenId,
      expiresAt: toEpochSeconds(this.expiresAt),
    };
  }
}
