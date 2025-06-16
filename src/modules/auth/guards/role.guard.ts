import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { intersection } from 'lodash';

import { RolesEnum } from '../../../common/enums';
import { Roles } from '../../../common/decorators';
import { UserEntity } from '../../user/entities';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles: RolesEnum[] = this.reflector.get(
      Roles,
      context.getHandler(),
    );

    if (!requiredRoles || Object.keys(requiredRoles).length === 0) return true;

    const request = context.switchToHttp().getRequest<{ user: UserEntity }>();
    const user = request.user;

    if (user.roles && user.roles.includes(RolesEnum.SUPER_ADMIN)) {
      return true;
    }

    if (!user || !user.roles) return false;

    // Check if at least one of the user's roles matches the required roles
    return intersection(requiredRoles, user.roles).length > 0;
  }
}
