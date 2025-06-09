import { IsBoolean, IsEmail, IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Match } from '../../../common/validators';
import { IsUniqUserEmail } from '../../user/validators';
import { passwordRegExp } from '../../user/constants';

export class RegisterDto {
  @ApiProperty()
  @IsEmail()
  @IsUniqUserEmail()
  email: string;

  @ApiProperty({ minLength: 2, maxLength: 50 })
  @IsString()
  @Length(2, 50)
  firstName: string;

  @ApiProperty({ minLength: 2, maxLength: 50 })
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
}
