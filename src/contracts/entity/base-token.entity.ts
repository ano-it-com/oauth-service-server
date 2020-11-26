import { BaseEntity } from '@iac-auth/contracts/entity/base.entity';
import { Column } from 'typeorm';

export abstract class BaseToken extends BaseEntity {
  @Column({ type: 'timestamp without time zone' })
  expiresAt: Date;

  @Column({ type: 'boolean', default: false })
  revoked: boolean;

  @Column({ type: 'timestamp without time zone', nullable: true })
  revokedAt: Date;

  public abstract toPayload(): any;
}
