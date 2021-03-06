import { BaseEntity } from '@iac-auth/contracts/entity/base.entity';
import { Logger } from '@nestjs/common';
import { Repository } from 'typeorm';

export abstract class BaseTokenService<
  E extends BaseEntity & { revoked: boolean }
> {
  protected readonly logger = new Logger(this.constructor.name);

  protected constructor(protected readonly repository: Repository<E>) {}

  public revoke(repo = this.repository, token: E): Promise<E> {
    token.revoked = true;
    return (repo.save(token as any) as unknown) as Promise<E>;
  }

  protected getExpiration(ttl: number): Date {
    const expiration = new Date();
    expiration.setUTCSeconds(expiration.getUTCSeconds() + ttl);

    return expiration;
  }
}
