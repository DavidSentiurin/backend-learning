import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { UserEntity } from '../entities';

export const GetUser = createParamDecorator(
  (field: keyof UserEntity, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: UserEntity = request.user;

    return field ? user[field] : user;
  }
);
