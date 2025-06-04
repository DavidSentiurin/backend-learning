import { Reflector } from '@nestjs/core';

import { RolesEnum } from '../../common/enums';

export const Roles = Reflector.createDecorator<RolesEnum[]>();
