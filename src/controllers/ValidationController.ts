import { isEmpty } from 'lodash';
import validate from 'uuid-validate';
import { FindOneOptions } from 'typeorm';
import { Request, RequestHandler, NextFunction, Response } from 'express';

import Validator from '../validations/Validator';
import AbstractController from './AbstractController';
import IValidatable from '../interfaces/IValidatable';
import AbstractService from '../services/AbstractService';

export default abstract class ValidationController<T> extends AbstractController<T> {
  protected constructor(service: AbstractService<T>) {
    super(service);
  }

  private validatable!: IValidatable;

  /**
   * Creates and returns an instance of Validator
   *
   * @returns {Validator} an instance of validator
   * @memberOf ValidationController
   */
  protected getValidator(): Validator {
    return new Validator();
  }

  /**
   * Gets a list of fields names to exclude from validation. This is 
   * useful when performing partial updates on an instance.
   * Note: All fields in the returned array will not be validated
   *
   * @param {Request} req
   * @returns {Array<string>} array of fields names to exclude from validation
   * @memberOf ValidationController
   */
  protected getExcludedFields(req: Request): Array<string> {
    const path = req.path.startsWith('/auth') ? req.path.split('/')[0] : req.path.split('/')[1];

    switch (path.toLowerCase()) {
      case 'profile':
        return this.validatable.excludeFillables(req.body);
      case 'password':
        return ['firstName', 'lastName', req.method === 'PUT' ? 'email' : 'password'];
      case 'signin':
        return ['firstName', 'lastName'];
      default:
        return [];
    }
  }

  /**
   * Validates request inputs
   *
   * @returns RequestHandler
   * @memberOf ValidationController
   */
  public validateInputs (): RequestHandler {
    return this.tryCatch(async (req: Request, res: Response, next: NextFunction): Promise<Function> => {

      if (req.method === 'PUT' && isEmpty(req.body))
        throw this.error('', this.httpStatus.NOT_MODIFIED);
      else {
        this.validatable = this.getServiceInstance().getRepository(); // Get the validatable repository instance

        const {
          errors, hasError
        } = await this.getValidator().validateInputs<T>(
            this.getServiceInstance().getRepository().build(req.body),
           { skip: this.getExcludedFields(req) } // Don't validate array of fields returned here
          );

          if (hasError) throw this.error(errors, this.httpStatus.BAD_REQUEST);

          return next;
        }
      },
    );
  }

  /**
   * Validates pagination parameters
   *
   * @returns RequestHandler
   * @memberOf ValidationController
   */
  public validatePaginationParameters (): RequestHandler {
    return this.tryCatch(async (req: Request, res: Response, next: NextFunction): Promise<Function> => {
      const { query: { sort, page, limit }} = req;
      // TODO: validate sort query param

        if (page || limit) {
          const { 
            errors, 
            hasError 
          } = await this.getValidator().validatePagination(parseInt(limit as string), parseInt(page as string));

          if (hasError) throw this.error(errors, this.httpStatus.BAD_REQUEST);
        }

        return next;
      },
    );
  }

  /**
   * Validates uuid parameter(s) in request URI
   *
   * @param {uuid} param the uuid param to validate
   * @returns RequestHandler
   * @memberof ValidationController
   */
  public validateUuid(param: string): RequestHandler {
    return this.tryCatch(
      async (req: Request, res: Response, next: NextFunction): Promise<Function> => {
        if (validate(req.params[param])) return next;

        throw this.error(this.getMessage('error.param', param), this.httpStatus.BAD_REQUEST);
      },
    );
  }

  /**
   * Checks if an instance of T exist in storage
   *
   * @param {string} param the parameter to search with
   * @param {string} [alias] an alias for the instance if not found
   * @returns {RequestHandler} a function that takes an async callback that handles the GET request
   * @memberof ValidationController
   */
  public checkIfExist (param: string, alias?: string): RequestHandler {
    return this.tryCatch(async (req: Request, res: Response, next: NextFunction): Promise<Function> => {
      const data: T = await this.getServiceInstance().findOneOrFail({
        id: req.params[param]
      } as FindOneOptions<T>, alias);

      if (req.method  !== 'GET') {
        req.body = {
          ...req.body, // keep whatever that was appended to the request body
          [this.foundRecordKey()]: data
        };
      }

      return next;
    });
  }
}
