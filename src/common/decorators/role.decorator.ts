import { Reflector } from '@nestjs/core';

import { RolesEnum } from '../enums';

export const Roles = Reflector.createDecorator<RolesEnum[]>();
