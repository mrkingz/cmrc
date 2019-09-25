import User from '../entities/User';
import {
  registerDecorator,
  ValidationOptions, 
  ValidatorConstraint, 
  ValidationArguments,
  ValidatorConstraintInterface
} from "class-validator";



@ValidatorConstraint({ async: true })
class EmailConstraint implements ValidatorConstraintInterface {
  async validate (email: string, args: ValidationArguments): Promise<boolean> {
    const user = await User.findOne({ select: ['email'], where: { 'email': email } });
    return user ? false : true;
  }
}

const IsUniqueEmail: Function  = (validationOptions?: ValidationOptions): Function => {
  return (object: Object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: EmailConstraint

    })
  }
}

export {
  IsUniqueEmail
};
