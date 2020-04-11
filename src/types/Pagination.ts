
export interface IPaginationData {
  skip: number;
  currentPage: number;
  itemsPerPage: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
}

  export interface PaginationMeta {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPage: number;
}

export interface Pagination<T> {
  data: Array<T>;
  pagination: PaginationMeta;
}