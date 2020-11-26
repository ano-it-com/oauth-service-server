import { Column, Entity } from 'typeorm';
import { BaseEntity } from '@iac-auth/contracts/entity/base.entity';

@Entity({ name: 'keys' })
export class KeyEntity extends BaseEntity {
  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  type: 'public' | 'private';

  @Column({ type: 'text' })
  data: string;
}
