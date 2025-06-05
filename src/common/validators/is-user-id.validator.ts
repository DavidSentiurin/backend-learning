import {
  isUUID,
  registerDecorator,
  ValidationArguments,
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

  async validate(userId: string, args: ValidationArguments): Promise<boolean> {
    if (!isUUID(userId)) return false;

    const user = await this.usersService.findById(userId);

    const throwErrorIfNotFound = Boolean(args.constraints[0]);

    if (throwErrorIfNotFound && !user)
      throw new NotFoundException('The user is not found.');

    return !!user;
  }

  defaultMessage(): string {
    return 'The user is not found.';
  }
}

export function IsUserId(
  throwErrorIfNotFound: boolean = false,
  validationOptions?: ValidationOptions,
) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [throwErrorIfNotFound],
      validator: IsUserIdConstraint,
    });
  };
}
