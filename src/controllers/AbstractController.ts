import { camelCase } from 'lodash';
import isEmpty from 'lodash.isempty';
import * as Sentry from '@sentry/node';
import { Request, RequestHandler, Response, NextFunction } from 'express';

import configs from '../configs';
import constants from '../constants';
import IResponse from '../types/Response';
import Utilities from '../utilities/Utilities';
import { Pagination } from '../types/Pagination';
import CustomError from '../utilities/CustomError';
import AbstractService from '../services/AbstractService';

const { httpStatus } = constants;

export default abstract class AbstractController<T> extends Utilities {
  
  protected baseUrl!: string;
  protected authUser!: T;
  protected readonly httpStatus = httpStatus;

  protected readonly service: AbstractService<T>;
  protected data!: T | Pagination<T>;

  protected constructor(service: AbstractService<T>) {
    super();
    this.service = service;
  }

  /**
   * Handles error response
   *
   * @protected
   * @param {Response} res HTTP response object
   * @param {CustomError} error the CustomError to return to 
   * @returns the HTTP response
   * @memberof AbstractController<T>
   */
  protected errorResponse(res: Response, exception: CustomError) {
    const { error, status } = exception;

    return res.status(status || this.httpStatus.SERVER_ERROR).json({
      success: false,
      error,
    });
  }

  protected foundRecordKey(): string {
    return camelCase(
      `_found${this.getServiceInstance()
        .getRepository()
        .getEntityName()}`,
    );
  }

  /**
   *Gets the response data, status and message
   *
   * @protected
   * @param {object} data
   * @param {string} message
   * @param {number} the status code
   * @returns IResponse<T>
   * @memberof AbstractController<T>
   */
  protected getResponse(message?: string, status?: number): IResponse<T> {
    const { pagination, ...details } = this.data as Pagination<T>;

    if (!isEmpty(this.data)) {
      const entity = pagination ? details.data : details;
      let response: { [key: string]: string | number | object } = {
        status: status || this.httpStatus.OKAY,
      };
      response = message ? { ...response, message } : response;

      if (Array.isArray(entity)) {
        response.data = isEmpty(entity) ? [] : (entity as Array<T>);
        return isEmpty(entity) ? response : { ...response, meta: { pagination } };
      } else {
        response.data = entity;
        return response;
      }
    }

    return { status, message };
  }

  /**
   * Gets an instance of AbstractService<T>
   *
   * @returns an instance of AbstractService<T>
   */
  protected getServiceInstance(): AbstractService<T> {
    return this.service;
  }

  /**
   * Returns an HTTP response to the client
   *
   * @param {Request} req
   * @param {Response} res
   * @param {ResponseOptions<T>} options
   * @returns void
   * @memberof AbstractController<T>
   */
  protected httpResponse(res: Response, options: IResponse<T>): Response {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { keep, message, success, status, ...data } = options;
    const statusCode = status || this.httpStatus.OKAY;
    // this.setAuthUser({} as T);

    return res.status(statusCode).json({
      success: success || statusCode < this.httpStatus.BAD_REQUEST,
      message,
      ...data,
    });
  }

  /**
   * Sets the base URL
   *
   * @protected
   * @param {Request} req
   * @returns void
   * @memberof AbstractController<T>
   */
  protected getBaseUrl(req: Request): string {
    const baseURL = req.app.settings.env !== 'production' ? `${req.protocol}://${req.get('host')}` : configs.api.apiURL;

    return `${baseURL}/api/v${configs.api.version}`;
  }

  /**
   * Runs a callback function asynchronously
   *
   * @protected
   * @param {Function} callback
   * @returns {Promise<Function>} an asynchronous function
   * @memberof AbstractController<T>
   */
  protected tryCatch(callback: Function): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
      try {
        const response = await callback(req, res, next);

        return typeof response === 'function' ? response() : this.httpResponse(res, response);
      } catch (error) {
        // Log internal/uncaught errors to Sentry
        if (!(error instanceof CustomError)) {
          Sentry.captureException(error);
          error = this.error(this.getMessage('error.server'));
        }
        return this.errorResponse(res, error);
      }
    };
  }
}
