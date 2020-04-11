export interface ISearchOptions {
  page: string;
  limit: string;
  sort: string;
}

export interface ISearchPayload {
  query: string;
  fields: Array<string>;
}

export interface SearchHit {
  _id: string;
  _source: object;
}
