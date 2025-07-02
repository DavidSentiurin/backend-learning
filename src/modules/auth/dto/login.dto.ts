import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsUserEmailExist } from '../../user/validators';
import { UnauthorizedException } from '@nestjs/common';

export class LoginDto {
  @ApiProperty()
  @IsEmail()
  @IsUserEmailExist(
    new UnauthorizedException([
      'The email or password you entered is incorrect',
    ]),
  )
  email: string;

  @ApiProperty()
  @IsString()
  password: string;
}
