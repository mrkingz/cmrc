
export interface IPaginationData {
  skip: number;
  currentPage: number;
  itemsPerPage: number;
}

export interface PaginationParams {
  page: string;
  limit: string;
  sort?: Array<object>;
}