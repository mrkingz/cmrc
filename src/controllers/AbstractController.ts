import { isUndefined } from 'util';
import isEmpty from 'lodash.isempty';
import { NextFunction } from 'connect';
import { Request, Response } from 'express';

import configs from '../configs';
import constants from '../constants';
import CustomError from '../services/utilities/CustomError';
import UtilityService from '../services/utilities/UtilityService';
import HTTPResponseOptions from '../interfaces/HTTPResponseOptions';
import IHTTPResponseOptions from '../interfaces/HTTPResponseOptions';
import RespositoryService from '../services/repositories/AbstractRepository';


const { status } = constants;
export default abstract class AbstractController<T>  extends UtilityService {

  /**
   * @description the base URL of the application
   *
   * @protected
   * @type {string}
   * @memberof AbstractController<T>
   */
  protected baseURL!: string;

  /**
   * @description Status code for a newly created resource
   *
   * @protected
   * @type {number}
   * @memberof AbstractController
   */
  protected readonly CREATED: number = status.CREATED;

  /**
   * @description Status code for a successfull request
   *
   * @protected
   * @type {number}
   * @memberof AbstractController<T>
   */
  protected readonly OKAY: number = status.OKAY

  /**
   * @description Status code for bad request
   *
   * @protected
   * @type {number}
   * @memberof AbstractController<T>
   */
  protected readonly BAD_REQUEST: number = status.BAD_REQUEST;

  /**
   * @description Status code for a conflicting request
   *
   * @protected
   * @type {number}
   * @memberof AbstractController
   */
  protected readonly CONFLICT: number = status.CONFLICT;

  /**
   * @description The authenticated user
   *
   * @protected
   * @type {T}
   * @memberof AbstractController<T>
   */
  protected authUser!: T;

  /**
   * @description Status code for an unauthorized request
   *
   * @protected
   * @type {number}
   * @memberof AbstractController<T>
   */
  protected readonly UNAUTHORIZED: number = status.UNAUTHORIZED;

  protected constructor() {
    super();
  }

  /**
   * @description Handles error response
   *
   * @param {Request} req
   * @param {Response} res
   * @param {CustomError} errors
   * @returns
   * @memberof AbstractController<T>
   */
  errorResponse (req: Request, res: Response, errors: CustomError) {
    const { error, status } = errors;

    return res.status(status || 500).json({ 
      success: false,
      [typeof error === 'string' ? 'message' : 'errors' ]: errors
        // error && req.app.settings.env === 'development' 
        //   ? error
        //   : this.getMessage('error.server')
    });
  }

  /**
   * @description Filters hidden fields/properties from the JSON response data
   *
   * @private
   * @param {{[key: string]: any }} entity
   * @returns {T}
   * @memberof AbstractController<T>
   */
  private filterJSONResponse (entity: {[key: string]: any }): T {
    const filtered: {[key: string]: any } = {};

    const hiddenFields: Array<string> = this.getRepository().getHiddenFields();
    Object.keys(entity).forEach(key => {
      if (!hiddenFields.includes(key)) {
        filtered[key] = entity[key]
      }
    })

    return filtered as T;
  }

  /**
   * @description Gets the base URL
   *
   * @protected
   * @returns {string} the base URL
   * @memberof AbstractController<T>
   */
  protected getBaseURL (): string {
    return this.baseURL;
  }


  /**
   * @description Gets the authenticated user
   *
   * @protected
   * @returns {T}
   * @memberof AbstractController<T>
   */
  protected getAuthUser (): T {
    return this.authUser;
  }
    /**
   * @description Gets the respository service instance
   *
   * @protected
   * @abstract
   * @returns {RespositoryService<T>}
   * @memberof AbstractController<T>
   */
  protected abstract getRepository (): RespositoryService<T>;

  /**
   * @description Gets the response data, status and message
   *
   * @protected
   * @param {object} data
   * @param {string} message
   * @param {number} [status=200]
   * @returns {object}
   * @memberof AbstractController<T>
   */
  protected getResponseData (data: {[key: string]: any }, message?: string, status?: number): IHTTPResponseOptions<T> {
    
    const { token, pagination, ...details } = data;

    if (!isEmpty(data)) {
      const entity = isUndefined(pagination) ? details : details.data;

      let response: {[key: string]: string | number | object } = { 
        status: status || this.OKAY,
        data: {
          [this.getResponseDataKey(entity)]: this.filterJSONResponse(entity), 
          token
        }
      };
      response = message ? { ...response, message } : response;

      // If response is an array, apply the pagination meta data
      return Array.isArray(entity)
        ? { ...response, meta: { pagination } }
        : response;
    } 
      
    return { status, message };
  }

  /**
   * @description Gets the corresponding key the data will be mapped to
   * 
   * @param {Object | Array<any>} data 
   * @returns {string}
   * @memberof AbstractController<T>
   */
  private getResponseDataKey (data: T | Array<any>): string {
    let key = this.getRepository().getEntityName().toLowerCase();
    /**
     * Check if data is an array
     * We would pluralize it accordingly
     */ 
    if (Array.isArray(data)) {
      /**
       * If the name of the entity ends with 'y',
       * pluralize the key using 'ies'; otherwise, just add 's'
       */ 
      key = key.endsWith('y')
      ? `${key.substr(0, key.length)}ies` 
      : `${key}s`;
    }

    return key;
  }

  /**
   * @description Returns an HTTP response to the client
   * 
   * @param {Request} req
   * @param {Response} res 
   * @param {ResponseOptions<T>} options 
   * @returns void
   * @memberof AbstractController<T>
   */
  protected httpResponse (req: Request, res: Response, options: HTTPResponseOptions<T>): void {
    let { keep, message, status, success, ...data } = options;

    //Todo: Do something with keep

    status = status || this.OKAY;
    res.status(status).json({
      success: success || status < this.BAD_REQUEST,
      message,
      ...data
    });
  }

  /**
   * @description Sets the authenticated user
   *
   * @protected
   * @param {T} user
   * @returns void
   * @memberof @memberof AbstractController<T>
   */
  protected setAuthUser (user: T): void {
    this.authUser = user;
  }

  /**
   * @description Sets the base URL
   *
   * @protected
   * @param {Request} req
   * @returns void
   * @memberof AbstractController<T>
   */
  protected setBaseURL (req: Request): void {
    let baseURL;
    if (req.app.settings.env !== 'production') {
      baseURL = `${req.protocol}://${req.get('host')}`;
    } else {
      baseURL = configs.api.apiURL;
    }
    this.baseURL = `${baseURL}/api/v${configs.api.version}`;
  }

  /**
   * @description Runs a callback function asynchronously
   *
   * @protected
   * @param {Function} callback
   * @returns {Promise<Function>} an asynchronous function
   * @memberof AbstractController<T>
   */
  protected tryCatch (callback: Function) {
    return async (req: Request, res: Response, next: NextFunction): Promise<any> => {
      try {
        const response = await callback(req, res, next) as any;
        /**
         *  Sometimes we may want to delegate request to the next middleware 
         *  or even call a function that is returned by the call back
         *  we check for the type of response received, and then use it accordingly
         */ 
        return (response.constructor === Function)
          ? response()
          : this.httpResponse(req, res, response);
      } catch (error) {
        return this.errorResponse(req, res, error);
      }
    }
  }
}