import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ConflictException, Injectable } from '@nestjs/common';

import { UserService } from '../user.service';

@ValidatorConstraint({ name: 'IsUniqUserEmailConstraint' })
@Injectable()
export class IsUniqUserEmailConstraint implements ValidatorConstraintInterface {
  constructor(private readonly usersService: UserService) {}

  async validate(userEmail: string): Promise<boolean> {
    const user = await this.usersService.findByEmail(userEmail);

    if (user) throw new ConflictException('The user already exists.');

    return true;
  }
}

export function IsUniqUserEmail(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsUniqUserEmailConstraint,
    });
  };
}
