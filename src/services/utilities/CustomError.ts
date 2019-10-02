export default class CustomError extends Error {
  public error: string | object;
  public status: number;

  constructor(error: string | object, status?: number) {
    super();
    this.error = error;
    this.status = status || 400;
  }

  public toString() {
    return this.error;
  }
}