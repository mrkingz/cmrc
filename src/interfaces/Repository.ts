import { ValidatorOptions } from 'class-validator';

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