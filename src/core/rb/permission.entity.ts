import { BaseEntity } from '@iac-auth/contracts/entity/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { RoleEntity } from '@iac-auth/core/rb/role.entity';

@Entity({ name: 'permissions', orderBy: { name: 'ASC' } })
export class PermissionEntity extends BaseEntity {
  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  alias: string;

  @Column({ type: 'boolean', default: false })
  create: boolean;

  @Column({ type: 'boolean', default: true })
  read: boolean;

  @Column({ type: 'boolean', default: false })
  edit: boolean;

  @Column({ type: 'boolean', default: false })
  delete: boolean;

  @ManyToOne(
    type => RoleEntity,
    role => role.permissions,
    {
      onDelete: 'CASCADE',
    },
  )
  role!: Promise<RoleEntity>;
}
