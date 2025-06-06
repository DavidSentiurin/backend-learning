import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { IsUserId } from '../validators';

export class UserIdDto {
  @ApiProperty()
  @IsUserId(false)
  @IsUUID()
  id: string;
}
