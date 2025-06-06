import { Column, Entity } from 'typeorm';

import { LanguagesEnum, RolesEnum } from '@project-common/enums';
import { MyBaseEntity } from '@project-common/entities';

@Entity('users')
export class UserEntity extends MyBaseEntity {
  @Column({ nullable: true, length: 2083 })
  avatar?: string;

  @Column({ unique: true, length: 200 })
  email: string;

  @Column({ name: 'first_name', length: 50 })
  firstName: string;

  @Column({ name: 'last_name', length: 50 })
  lastName: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: LanguagesEnum,
    default: LanguagesEnum.English,
  })
  language?: LanguagesEnum;

  @Column({ name: 'is_terms_confirmed', type: 'boolean' })
  isTermsConfirmed: boolean;

  @Column({
    type: 'enum',
    enum: RolesEnum,
    array: true,
  })
  roles: RolesEnum[];
}
