export default interface HTTPResponseOptionsInterface<T> {
  keep?: boolean;
  message?: string;
  status?: number;
  success?: boolean;
  data: T
}