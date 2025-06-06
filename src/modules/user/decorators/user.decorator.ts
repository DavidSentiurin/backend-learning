import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { UserEntity } from '../entities';

export const GetUser = createParamDecorator(
  (field: keyof UserEntity, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user: UserEntity }>();
    const user = request.user;

    return field ? user[field] : user;
  },
);
