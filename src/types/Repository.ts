export interface IFindConditions {
  select?: object;
  where?: object;
  limit?: string | number;
  page: string | number;
  sort?: string | number;
  status?: boolean;
}

export type Indexable = {
  [key: string]: string | boolean | number | { [key: string]: string } | [];
};

export interface IDuplicateOptions<T> {
  conditions: T;
  not?: T;
}
