import {Partials} from "../types/Validations";

export default interface IValidatable {

  /**
   * @description Builds an instance of the entity to validate with the fields
   *
   * @param fields
   * @returns {T} the entity instance
   * @memberOf IValidatable
   */
  //build<T> (fields: T): T;

  /**
   * @description Gets an array of fields to exclude from the validation
   *
   * @param {T} fields the fields from the request body
   */
  excludeFillables(fields: object): Array<string>;
}