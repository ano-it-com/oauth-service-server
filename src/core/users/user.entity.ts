import {
  AfterLoad,
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { Exclude, Expose } from 'class-transformer';
import gravatar from 'gravatar';
import { BaseEntity } from '@iac-auth/contracts/entity/base.entity';
import { OAuthAccessTokenEntity } from '@iac-auth/core/oauth2/oauth-access-token.entity';
import { hashValue, verifyValue } from '@iac-auth/library/cypher';
import { Scopes } from '@iac-auth/core/oauth2/const';
import { RoleEntity } from '@iac-auth/core/rb/role.entity';
import { ClientEntity } from '@iac-auth/core/oauth2/client.entity';
import { JoinColumn, ManyToOne, OneToOne } from 'typeorm/index';

@Entity({ name: 'users' })
export class UserEntity extends BaseEntity {
  @Column({ unique: true, nullable: true })
  username: string;

  @Column({ type: 'varchar', nullable: false })
  firstName: string;

  @Column({ type: 'varchar', nullable: true })
  lastName: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Exclude()
  @Column({ length: 256, select: false })
  password: string;

  @OneToMany(
    type => OAuthAccessTokenEntity,
    at => at.user,
  )
  tokens: Promise<OAuthAccessTokenEntity>;

  @ManyToMany(
    type => RoleEntity,
    role => role.users,
    { cascade: true, eager: true },
  )
  @JoinTable({ name: 'roles_to_users' })
  roles: RoleEntity[];

  @Column({ type: 'timestamp with time zone', nullable: true })
  bannedAt: Date;

  @ManyToOne(type => UserEntity, { onUpdate: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'bannedBy', referencedColumnName: 'id' })
  bannedBy: UserEntity;

  @Column({ type: 'boolean', default: false })
  isSSOAdmin: boolean;

  @Column({ type: 'boolean', default: false })
  fromLDAP: boolean;

  @ManyToMany(
    type => ClientEntity,
    client => client.acceptedUsers,
  )
  allowedClients: ClientEntity[];

  @Exclude()
  tmpPassword!: string;

  @AfterLoad()
  private loadTmpPassword() {
    this.tmpPassword = this.password;
  }

  @Expose()
  get picture(): string {
    return gravatar.url(this.email, {
      rating: 'g',
      default: 'retro',
    });
  }

  @BeforeUpdate()
  @BeforeInsert()
  private async encryptPassword() {
    if (this.password) {
      if (this.tmpPassword !== this.password) {
        this.password = await hashValue(this.password);
      }
    }
  }

  public listRoles(): string[] {
    return this.roles.map(_ => _.alias);
  }

  public validatePassword(password: string): Promise<boolean> {
    return verifyValue(password, this.password);
  }

  public toOpenIdProfile(scopes: Scopes[]): Record<any, any> {
    return {
      sub: this.id,
      ...(scopes.includes(Scopes.profile) && {
        picture: this.picture,
        nickname: this.username,
        updated_at: this.updatedAt,
        ...(this.firstName && {
          name: `${this.firstName} ${this.lastName}`.trimRight(),
        }),
      }),
      ...(scopes.includes(Scopes.permissions) && this.listRoles()),
      ...(scopes.includes(Scopes.email) && {
        email: this.email,
        email_verified: true, // todo email verification
      }),
    };
  }
}
