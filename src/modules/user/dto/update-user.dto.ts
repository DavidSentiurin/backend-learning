import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { LanguagesEnum, RolesEnum } from '@project-common/enums';
import { urlRegex } from '@project-common/constants';

import { IsUniqUserEmail } from '../validators';

export class UpdateUserDto {
  @ApiProperty()
  @IsOptional()
  @Matches(urlRegex, {
    message: 'Url format is invalid',
  })
  avatar?: string;

  @ApiProperty()
  @IsOptional()
  @IsEmail()
  @IsUniqUserEmail()
  email: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @Length(2, 50)
  firstName: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @Length(2, 50)
  lastName: string;

  @ApiProperty({ enum: LanguagesEnum })
  @IsOptional()
  @IsEnum(LanguagesEnum)
  language: LanguagesEnum;

  @ApiProperty({ enum: RolesEnum })
  @IsOptional()
  @IsEnum(RolesEnum)
  role: RolesEnum;
}
