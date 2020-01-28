import { isEmpty, camelCase } from 'lodash';
import validate from "uuid-validate";
import {Request, RequestHandler, NextFunction, Response} from 'express';

import Validator from "../validations/Validator";
import AbstractController from "./AbstractController";
import IValidatable from "../interfaces/IValidatable";
import {FindOneOptions} from "typeorm";

export default abstract class ValidationController<T> extends AbstractController<T> {

  private validatable!: IValidatable

  /**
   * Creates and returns an instance of Validator
   *
   * @returns {Validator} an instance of validator
   * @memberOf ValidationController
   */
  protected getValidator (): Validator {
    return new Validator();
  }

  /**
   * Gets a list of fields names to exclude from validation
   *
   * @param {Request} req
   * @returns {Array<string>} array of fields names to exclude from validation
   * @memberOf ValidationController
   */
  protected getExcludedFields (req: Request): Array<string> {

    const path = req.path.startsWith("/auth")
      ? req.path.split("/")[0]
      : req.path.split("/")[1];

    switch (path.toLowerCase()) {
      case 'profile':
        return this.validatable.excludeFillables(req.body);
      case 'password':
        return ['firstName', 'lastName', (req.method === 'PUT' ? 'email' : 'password')];
      case 'signin':
        return ['firstName', 'lastName'];
      default:
          return []
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
        this.validatable = this.getServiceInstance().getRepository();

        const {
          errors, hasError
        } = await this.getValidator().validateInputs<T>(
            this.getServiceInstance().getRepository().build(req.body),
           { skip: this.getExcludedFields(req) }
          );

        if (hasError)
          throw this.error(errors, this.httpStatus.BAD_REQUEST);

        return next;
      }
    })
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

      if (page || limit) {
        const { errors, hasError } = await this.getValidator().validatePagination(limit as number, page as number);

        if (hasError)
          throw this.error(errors, this.httpStatus.BAD_REQUEST);
      }

      return next;
    })
  }

  /**
   * Validates uuid parameter(s) in request URI
   *
   * @param {uuid} param the uuid param to validate
   * @returns RequestHandler
   * @memberof ValidationController
   */
  public validateUuid (param: string): RequestHandler {
    return this.tryCatch(async (req: Request, res: Response, next: NextFunction): Promise<Function> => {
      if (validate(req.params[param]))
        return next;

      throw this.error(`Parameter ${param} is not a valid uuid`, this.httpStatus.BAD_REQUEST);
    });
  }

  public checkIfExist (param: string, target?: string): RequestHandler {
    return this.tryCatch(async (req: Request, res: Response, next: NextFunction): Promise<Function> => {
      const found: T = await this.getServiceInstance().findOneOrFail(
        { id: req.params[param] } as FindOneOptions<T>, target
      );
      req[camelCase(this.getServiceInstance().getRepository().getEntityName())] = found;

      return next;
    })
  }
}
