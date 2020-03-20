import { ValidatorOptions } from 'class-validator';

export interface ValidationResponse {
  hasError: boolean;
  errors: { [key: string]: string };
}

export interface IValidatorOptions extends ValidatorOptions {
  skip?: Array<string>;
}

export type Partials<T> = {
  [P in keyof T]: T;
};
