import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function Match(property: string, validationOptions?: ValidationOptions) {
  return (object: Record<string, any>, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [property],
      validator: {
        validate(
          value: unknown,
          validationArguments?: ValidationArguments,
        ): Promise<boolean> | boolean {
          const relatedPropertyKey: unknown =
            validationArguments?.constraints?.[0];

          const relatedPropertyValue =
            validationArguments && typeof relatedPropertyKey === 'string'
              ? (validationArguments.object as Record<string, unknown>)[
                  relatedPropertyKey
                ]
              : undefined;

          return relatedPropertyValue === value;
        },
      },
    });
  };
}
