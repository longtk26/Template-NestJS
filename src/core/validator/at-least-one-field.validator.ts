import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'AtLeastOneField', async: false })
export class AtLeastOneFieldConstraint implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments): boolean {
    const object = args.object as Record<string, unknown>;
    const fields = args.constraints[0] as string[];

    const fieldsToCheck = fields.length > 0 ? fields : Object.keys(object);

    return fieldsToCheck.some(
      (field) => object[field] !== undefined && object[field] !== null,
    );
  }

  defaultMessage(args: ValidationArguments): string {
    if (args.constraints[0].length === 0) {
      return 'At least one field must be provided';
    }

    const fields = (args.constraints[0] as string[]).join(',');
    return `At least one of the fields ${fields} must be provided`;
  }
}

export function AtLeastOneField(
  fields: string[] = [],
  validationOptions?: ValidationOptions,
): ClassDecorator {
  return function (target: Function) {
    registerDecorator({
      name: 'AtLeastOneField',
      target: target,
      propertyName: undefined,
      options: validationOptions,
      constraints: [fields],
      validator: AtLeastOneFieldConstraint,
    });
  };
}
