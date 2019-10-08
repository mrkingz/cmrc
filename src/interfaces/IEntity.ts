import { Timestamp, FindConditions, FindOperator, ObjectType } from 'typeorm';

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
  passwordReset?: boolean;
  rememberMeToken?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};


export interface UpdateOptions {
  message?: string;
}

export interface IValidatorOptions extends ValidatorOptions {
  skip?: Array<string>
}

export interface IFindConditions {
  select?: object;
  where?: object;
  limit?: string | number;
  page: string | number;
  sort?: string | number;
  sortBy?: string;
}
