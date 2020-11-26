import { Column, Entity, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '@iac-auth/contracts/entity/base.entity';
import { ClientEntity } from '@iac-auth/core/oauth2/client.entity';
import { PermissionEntity } from '@iac-auth/core/rb/permission.entity';
import { UserEntity } from '@iac-auth/core/users/user.entity';

@Entity({ name: 'roles' })
export class RoleEntity extends BaseEntity {
  @Column({ type: 'varchar', unique: true, nullable: false })
  name: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  alias: string;

  @OneToMany(
    type => PermissionEntity,
    permission => permission.role,
  )
  permissions: PermissionEntity[];

  @ManyToMany(
    type => UserEntity,
    user => user.roles,
  )
  users: UserEntity[];

  @ManyToOne(
    type => ClientEntity,
    client => client.roles,
  )
  client?: ClientEntity;
}
