import { Timestamp } from "typeorm";
import { ValidatorOptions } from "class-validator";

export interface IUser {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  isAdmin?: boolean;
  isVerified?: boolean;
  photo?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};


export interface UpdateOptions {
  message?: string;
  skip?: Array<string>;
}

export interface IValidatorOptions extends ValidatorOptions {
  skip?: Array<string>
}