import { Pagination, PaginationMeta } from './Pangination';

export default interface IResponseData<T> {
  keep?: boolean;
  message?: string;
  status?: number;
  success?: boolean;
  meta?: object;
  pagination?: PaginationMeta;
  data?: T | Pagination<T>;
}
