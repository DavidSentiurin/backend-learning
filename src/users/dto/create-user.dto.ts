import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { omit } from 'lodash';

import { RolesEnum } from '../../common/enums';
import { Match, IsUniqUserEmail } from '../../common/validators';

import { passwordRegExp } from '../constants';

export class CreateUserDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty()
  @IsEmail()
  @IsUniqUserEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @Length(2, 50)
  firstName: string;

  @ApiProperty()
  @IsString()
  @Length(2, 50)
  lastName: string;

  @ApiProperty()
  @Matches(passwordRegExp)
  password: string;

  @ApiProperty()
  @Match('password', {
    message: 'confirm password do not match with password',
  })
  confirmPassword: string;

  @ApiProperty()
  @IsBoolean()
  isTermsConfirmed: boolean;

  @ApiProperty({ required: false, default: RolesEnum.USER })
  @IsEnum(RolesEnum)
  roles?: RolesEnum[];
}
