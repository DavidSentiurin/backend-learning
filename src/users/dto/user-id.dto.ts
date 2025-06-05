import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { IsUserId } from '../../common/validators';

export class UserIdDto {
  @ApiProperty()
  @IsUserId(false)
  @IsUUID()
  id: string;
}
