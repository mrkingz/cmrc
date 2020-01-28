export interface IFindConditions {
  select?: object;
  where?: object;
  limit?: string | number;
  page: string | number;
  sort?: string | number;
  status?: boolean;
}

export type Indexable<T> = {
  [P in keyof T]: T;
}