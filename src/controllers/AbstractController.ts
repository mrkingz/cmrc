import { NextFunction } from 'connect';
import { Request, Response, response } from 'express';

import configs from '../configs';
import constants from '../constants';
import UtilityService from '../services/utilities/UtilityService';
import HTTPResponseOptions from '../interfaces/IHTTPResponseOptions';
import RespositoryService from '../services/repositories/AbstractRepository';
import isEmpty from 'lodash.isempty';
import IHTTPResponseOptions from '../interfaces/IHTTPResponseOptions';
import { isUndefined } from 'util';

const { status } = constants;
export default abstract class AbstractController<T>  extends UtilityService {

  /**
   * @description the base URL of the application
   *
   * @protected
   * @type {string}
   * @memberof BaseController
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
   * @memberof AbstractController
   */
  protected readonly OKAY: number = status.OKAY

  /**
   * @description Status code for bad request
   *
   * @protected
   * @type {number}
   * @memberof AbstractController
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
   * @description Status code for an unauthorized request
   *
   * @protected
   * @type {number}
   * @memberof AbstractController
   */
  protected readonly UNAUTHORIZED: number = status.UNAUTHORIZED;

  constructor() {
    super();
  }
  
  /**
   * @description Gets the respository service instance
   *
   * @protected
   * @abstract
   * @returns {RespositoryService<T>}
   * @memberof AbstractController
   */
  protected abstract getRepository (): RespositoryService<T>;

  /**
   * @description Runs a callback function asynchronously
   *
   * @protected
   * @param {Function} callback
   * @returns {Promise<Function>} an asynchronous function
   * @memberof BaseController
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
          : this.statusResponse(req, res, response);

      } catch (error) {
        return res.status(error.status || 500).json({ 
          success: false,
          error: req.app.settings.env === 'development' 
            ? error.toString()
            : this.getMessage('error.server')
        });
      }
    }
  }

  /**
   * @description Gets the response data, status and message
   *
   * @protected
   * @param {object} data
   * @param {string} message
   * @param {number} [status=200]
   * @returns {object}
   * @memberof AbstractController
   */
  protected getResponseData (data: object, message: string, status: number = this.OKAY): IHTTPResponseOptions<T> {
    const { token, pagination, ...details } = data as any;

    if (isEmpty(data)) {
      return { status, message };
    } else {
      const entity = isUndefined(pagination) ? details : details.data;

      const response: {[key: string]: string | number | object } = { 
        status,
        message, 
        data: {
          [this.getResponseDataKey(entity)]: entity,
          token
        }
      };

      return Array.isArray(entity) && !isEmpty(entity)
        ? { ...response, meta: { pagination } }
        : response;
    }
  }

  /**
   * @description Gets the corresponding key the data will be mapped to
   * 
   * @param {Object | Array<any>} data 
   * @returns object
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
   */
  protected statusResponse (req: Request, res: Response, options: HTTPResponseOptions<T>): void {
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
   * @description Gets the base URL
   *
   * @protected
   * @returns {string} the base URL
   * @memberof UtilityService
   */
  protected getBaseURL (): string {
    return this.baseURL;
  }

  /**
   * @description Sets the base URL
   *
   * @protected
   * @param {Request} req
   * @returns void
   * @memberof UtilityService
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
}