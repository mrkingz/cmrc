export interface IFindConditions {
  select?: object;
  where?: object;
  limit?: number;
  page?: number;
  sort?: string;
  status?: boolean;
}

export type Indexable = {
  [key: string]: string | boolean | number | { [key: string]: string } | [];
};

export interface IDuplicateOptions<T> {
  conditions: T;
  not?: T;
}
