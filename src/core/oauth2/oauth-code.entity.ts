import { BaseEntity } from '@iac-auth/contracts/entity/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { ClientEntity } from '@iac-auth/core/oauth2/client.entity';
import { UserEntity } from '@iac-auth/core/users/user.entity';
import { AuthCodeData } from '@iac-auth/core/oauth2/interfaces';
import { toEpochSeconds } from '@iac-auth/utils/date.utility';

@Entity({ name: 'oauth-codes' })
export class OAuthCodeEntity extends BaseEntity {
  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'uuid' })
  clientId!: string;

  @Column({ type: 'simple-array', nullable: true })
  scopes!: string[];

  @Column({ type: 'boolean', default: false })
  revoked: boolean;

  @Column({ type: 'timestamp without time zone' })
  expiresAt: Date;

  @Column({ type: 'varchar' })
  redirectUri: string;

  @Column({ type: 'varchar', nullable: true })
  nonce?: string;

  @ManyToOne(
    type => ClientEntity,
    client => client.authCodes,
    {
      onDelete: 'CASCADE',
    },
  )
  client: Promise<ClientEntity>;

  @ManyToOne(type => UserEntity, {
    eager: true,
    onDelete: 'CASCADE',
  })
  user: UserEntity;

  toPayload(challenge?: string, challengeMethod?: string): AuthCodeData {
    return {
      id: this.id,
      expiresAt: toEpochSeconds(this.expiresAt),
      codeChallenge: challenge,
      codeChallengeMethod: challengeMethod,
    };
  }
}
