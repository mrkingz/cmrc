import {Pagination, PaginationMeta} from "./Pagination";
import {IUser} from "./User";

export default interface IResponse<T> {
  keep?: boolean;
  message?: string;
  status?: number;
  success?: boolean;
  meta?: object;
  pagination?: PaginationMeta;
  data?: T | Pagination<T>;
}
