/**
 *
 *
 * @export
 * @class CustomError
 * @extends {Error}
 */
export default class CustomError extends Error {
  public error: string | object;
  public status: number;

  /**
   * Creates an instance of CustomError.
   *
   * @param {(string | object)} error
   * @param {number} [status]
   * @memberof CustomError
   */
  constructor(error: string | object, status?: number) {
    super();
    Object.setPrototypeOf(this, CustomError.prototype);
    //this.message = typeof error === 'string' ? error : super.message;
    this.error = error;
    this.status = status || 500;
  }
}
