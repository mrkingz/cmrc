import { validate, ValidationError } from "class-validator";
import isEmpty from "lodash.isempty";
import { ValidationResponse } from '../types/Validations';
import configs from "../configs";
import Utilities from "../utilities/Utilities";
import {IValidatorOptions} from "../types/Validations";

export default class Validator extends Utilities {
  /**
   * @description Validate fields
   *
   * @param {T} entity the database entity
   * @param {IValidatorOptions} [options] validation options
   * - options.skip array of fields not to validate
   * @returns {Promise<T>} the validated fields to persist
   * @memberof Validator<T>
   */
  public async validateInputs<T> (entity: T, options: IValidatorOptions = {}): Promise<ValidationResponse> {
    
    const { skip, ...extraOptions } = options;
    const errors: { [key: string]: string } = {};

    const error: ValidationError[] = await validate(entity, {
      whitelist: true,
      forbidNonWhitelisted: true,
      skipMissingProperties: true,
      ...extraOptions
    });

    if (error.length > 0) {
      const sk = skip || [];

      error.forEach((error: ValidationError) => {
        // check for skipped fields
        if (!sk.includes(error.property)) {
          errors[error.property] = Object.values(error.constraints)[0] as string;
        }
      });
    }

    return { errors, hasError: !isEmpty(errors) }
  }

  /**
   * Computes pagination data
   *
   * @param {number} limit
   * @param {number} page
   * @returns the validation response
   * @memberof AbstractRepository mm
   */
  public async validatePagination (limit: number, page: number): Promise<ValidationResponse> {
    const { minItemsPerPage, maxItemsPerPage } = configs.api.pagination;
    const errors: { [key: string]: string } = {};

    if (limit && isNaN(limit)) {
      errors.limit = this.getMessage(`error.pagination.invalid`, `Pagination limit`)
    } else if (limit < minItemsPerPage) {
      errors.limit = this.getMessage(`error.pagination.minItems`, `${minItemsPerPage}`);
    } else if (limit > maxItemsPerPage) {
      errors.limit = this.getMessage(`error.pagination.maxItems`, `${maxItemsPerPage}`);
    }

    if (page && isNaN(page)) {
      errors.page = this.getMessage(`error.pagination.invalid`, `Page number`);
    } else if (page <= 0) {
      errors.page = this.getMessage(`error.pagination.page`);
    }

    return { errors, hasError: !isEmpty(errors) };
  }
}