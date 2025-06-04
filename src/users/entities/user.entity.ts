import { Column, PrimaryGeneratedColumn } from 'typeorm';

import { LanguagesEnum, RolesEnum } from '../../common/enums';

export class UserEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: true, length: 2000 })
  avatar?: string;

  @Column({ unique: true, length: 200 })
  email: string;

  @Column({ length: 50 })
  firstName: string;

  @Column({ length: 50 })
  lastName: string;

  @Column({ length: 200 })
  passwordHash: string;

  @Column({
    type: "enum",
    enum: LanguagesEnum,
    default: LanguagesEnum.English
  })
  language?: LanguagesEnum;

  @Column({ type: 'boolean', length: 1000 })
  isTermsConfirmed: boolean;

  @Column({
    type: "enum",
    enum: RolesEnum,
  })
  roles: RolesEnum[];
}
