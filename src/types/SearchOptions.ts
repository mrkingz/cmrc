export interface SearchOptions {
  page: string;
  limit: string;
  sort: string;
}

export interface SearchPayload {
  query: string;
  fields: Array<string>
}