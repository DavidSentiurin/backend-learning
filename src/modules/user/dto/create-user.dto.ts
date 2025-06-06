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

import { RolesEnum } from '@project-common/enums';
import { urlRegex } from '@project-common/constants';
import { Match } from '@project-common/validators';

import { IsUniqUserEmail } from '../validators';
import { passwordRegExp } from '../constants';

export class CreateUserDto {
  @ApiProperty()
  @IsOptional()
  @Matches(urlRegex, {
    message: 'Url format is invalid',
  })
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
  @Matches(passwordRegExp, {
    message:
      'Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character',
  })
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
