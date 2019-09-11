export default interface ResponseOptionsInterface<T> {
  keep?: boolean;
  message?: string;
  status?: number;
  success?: boolean;
  data: T
}