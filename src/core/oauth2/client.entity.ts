import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from 'typeorm';
import {
  GrantTypes,
  ResponseModes,
  ResponseTypes,
  Scopes,
  TokenAuthMethod,
} from '@iac-auth/core/oauth2/const';
import { BaseEntity } from '@iac-auth/contracts/entity/base.entity';
import { OAuthCodeEntity } from '@iac-auth/core/oauth2/oauth-code.entity';
import { OAuthAccessTokenEntity } from '@iac-auth/core/oauth2/oauth-access-token.entity';
import { BadRequestException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PermissionEntity } from '@iac-auth/core/rb/permission.entity';
import { RoleEntity } from '@iac-auth/core/rb/role.entity';
import { UserEntity } from '@iac-auth/core/users/user.entity';
import { JoinTable, ManyToMany } from 'typeorm/index';

@Entity({ name: 'clients' })
export class ClientEntity extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ type: 'text', nullable: true, unique: true })
  secret: string;

  @Column({
    type: 'simple-array',
    nullable: false,
    default: 'client_credentials,refresh_token',
  })
  grants: GrantTypes[];

  @Column({ type: 'simple-array', nullable: false, default: 'code' })
  responseTypes: ResponseTypes[];

  @Column({ type: 'simple-array', nullable: false, default: 'query' })
  responseModes: ResponseModes[];

  @Column({
    type: 'simple-array',
    nullable: false,
    default: `${Object.values(Scopes).join(',')}`,
  })
  scopes: string[];

  @Column({ type: 'boolean', default: false })
  firstParty: boolean;

  @Column({
    type: 'simple-array',
    nullable: false,
    default: 'client_secret_basic,client_secret_post',
  })
  authMethods: TokenAuthMethod[];

  @OneToMany(
    type => OAuthCodeEntity,
    code => code.client,
  )
  authCodes!: Promise<OAuthCodeEntity>;

  @OneToMany(
    type => OAuthAccessTokenEntity,
    token => token.client,
  )
  tokens!: Promise<OAuthAccessTokenEntity[]>;

  @Column({
    type: 'simple-array',
    nullable: true,
  })
  redirectUrls: string[];

  @OneToMany(
    type => RoleEntity,
    role => role.client,
  )
  roles?: Promise<RoleEntity[]>;

  @ManyToMany(
    type => UserEntity,
    user => user.allowedClients,
  )
  @JoinTable({ name: 'accepted_users_to_clients' })
  acceptedUsers?: UserEntity[];

  @BeforeInsert()
  createSecret(): void {
    if (!this.secret) {
      this.secret = randomBytes(32).toString('hex');
    }
  }

  canHandleGrant(grant: GrantTypes): boolean {
    return this.grants.includes(grant);
  }

  canHandleResponseType(rt: ResponseTypes): boolean {
    return this.responseTypes.includes(rt);
  }

  canHandleResponseMode(rm: ResponseModes): boolean {
    return this.responseModes.includes(rm);
  }

  canIssueScope(scope: string): boolean {
    return this.scopes.includes(scope);
  }

  canHandleAuthMethod(method: TokenAuthMethod): boolean {
    return this.authMethods.includes(method);
  }

  @BeforeInsert()
  @BeforeUpdate()
  checkAuthMethods(): void {
    if (this.authMethods) {
      if (
        this.authMethods.includes(TokenAuthMethod.none) &&
        this.authMethods.length > 1
      ) {
        throw new BadRequestException(
          'Client with token_endpoint_auth_method=none cannot have other auth methods',
        );
      }
    }
  }
}
