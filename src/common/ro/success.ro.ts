import { ApiProperty } from '@nestjs/swagger';

export class SuccessRo {
  @ApiProperty()
  success: boolean;
}
