// import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { IsUserId } from '../../common/validators';

export class UserIdDto {
  // @IsUUID()
  @ApiProperty()
  @IsUserId()
  id: string;
}
