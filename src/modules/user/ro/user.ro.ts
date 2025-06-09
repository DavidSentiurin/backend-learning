import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { Exclude, Expose, plainToInstance } from 'class-transformer';

import { UserEntity } from '../entities';
import { LanguagesEnum, RolesEnum } from '../../../common/enums';

export class UserRo {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty({ required: false })
  @Expose()
  avatar: string;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty()
  @Expose()
  firstName: string;

  @ApiProperty()
  @Expose()
  lastName: string;

  @ApiHideProperty()
  @Exclude()
  password: string;

  @ApiProperty({ enum: LanguagesEnum, required: false })
  @Expose()
  language: LanguagesEnum;

  @ApiProperty()
  @Expose()
  isTermsConfirmed: boolean;

  @ApiProperty({ enum: RolesEnum })
  @Expose()
  roles: RolesEnum[];

  static fromEntity(user: UserEntity): UserRo {
    return plainToInstance(UserRo, user);
  }
}
