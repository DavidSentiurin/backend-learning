import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable, NotFoundException } from '@nestjs/common';

import { UserService } from '../user.service';

@ValidatorConstraint({ name: 'IsUserEmailExistConstraint' })
@Injectable()
export class IsUserEmailExistConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly usersService: UserService) {}

  async validate(email: string, args: ValidationArguments): Promise<boolean> {
    const user = await this.usersService.findByEmail(email);

    const [httpExceptionInstance] = args.constraints;

    if (httpExceptionInstance && !user) throw httpExceptionInstance;

    return !!user;
  }

  defaultMessage(): string {
    return 'The user is not found.';
  }
}

export function IsUserEmailExist(
  httpExceptionInstance = new NotFoundException('The user is not found.'),
  validationOptions?: ValidationOptions,
) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [httpExceptionInstance],
      validator: IsUserEmailExistConstraint,
    });
  };
}
