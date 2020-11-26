import { AccessTokenJwtPayload } from '@iac-auth/core/oauth2/interfaces';
import { toEpochSeconds } from '@iac-auth/utils/date.utility';
import { BaseToken } from '@iac-auth/contracts/entity/base-token.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { GrantTypes } from '@iac-auth/core/oauth2/const';
import { ClientEntity } from '@iac-auth/core/oauth2/client.entity';
import { UserEntity } from '@iac-auth/core/users/user.entity';

@Entity({ name: 'oauth-access-tokens' })
export class OAuthAccessTokenEntity extends BaseToken {
  @Column({ type: 'uuid', nullable: true })
  userId: string;

  @Column({ type: 'uuid', nullable: false })
  clientId: string;

  @Column({ type: 'varchar', array: true, nullable: true })
  scopes: string[];

  @Column({ type: 'varchar', enum: GrantTypes })
  grantType: GrantTypes;

  @ManyToOne(
    type => ClientEntity,
    client => client.tokens,
    {
      onDelete: 'CASCADE',
    },
  )
  client!: Promise<ClientEntity>;

  @ManyToOne(
    type => UserEntity,
    user => user.tokens,
    {
      onDelete: 'CASCADE',
    },
  )
  user: Promise<UserEntity>;

  public toPayload(): AccessTokenJwtPayload {
    return {
      aud: this.clientId,
      audience: this.clientId,
      jti: this.id,
      nonce: this.id,
      exp: toEpochSeconds(this.expiresAt),
      sub: this.userId,
      scopes: this.scopes,
    };
  }
}
