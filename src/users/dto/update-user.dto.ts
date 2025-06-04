import { IsEmail, IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { LanguagesEnum, RolesEnum } from '../../common/enums';

import { IsUniqUserEmail } from '../../common/validators';

export class UpdateUserDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
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
  language: string;

  @ApiProperty({ enum: RolesEnum })
  @IsOptional()
  @IsEnum(RolesEnum)
  userType: RolesEnum;
}
