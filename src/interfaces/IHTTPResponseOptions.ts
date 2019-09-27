export default interface IHTTPResponseOptions<T> {
  keep?: boolean;
  message?: string;
  status?: number;
  success?: boolean;
  data?: T
}