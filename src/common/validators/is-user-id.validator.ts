import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable, NotFoundException } from '@nestjs/common';

import { UsersService } from '../../users/users.service';

@ValidatorConstraint({ name: 'IsUserIdConstraint' })
@Injectable()
export class IsUserIdConstraint implements ValidatorConstraintInterface {
  constructor(private readonly usersService: UsersService) {}

  async validate(userId: string): Promise<boolean> {
    const user = await this.usersService.findById(userId);

    if (!user) throw new NotFoundException('The user is not found.');

    return true;
  }
}

export function IsUserId(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsUserIdConstraint,
    });
  };
}
