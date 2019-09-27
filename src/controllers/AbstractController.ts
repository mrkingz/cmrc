import { NextFunction } from 'connect';
import { Request, Response } from 'express';

import configs from '../configs';
import constants from '../constants';
import UtilityService from '../services/utilities/UtilityService';
import HTTPResponseOptions from '../interfaces/IHTTPResponseOptions';
import RespositoryService from '../services/repositories/RepositoryService';
import isEmpty from 'lodash.isempty';
import IHTTPResponseOptions from '../interfaces/IHTTPResponseOptions';

const { http } = constants;
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
   * @description Status for a newly created resource
   *
   * @protected
   * @type {number}
   * @memberof AbstractController
   */
  protected readonly CREATED: number = http.CREATED;

  protected readonly OKAY: number = http.OKAY

  protected readonly BAD_REQUEST: number = http.BAD_REQUEST;

  /**
   * @description Status code for an unauthorized operation
   *
   * @protected
   * @type {number}
   * @memberof AbstractController
   */
  protected readonly UNAUTHORIZED: number = http.UNAUTHORIZED;

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
  protected abstract getRespositoryService (): RespositoryService<T>;

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
          : this.httpResponse(req, res, response);

      } catch (error) {
        return res.status(error.status || 500).json({ 
          success: false,
          error: req.app.settings.env === 'development' 
            ? error.toString()
            : this.getLang('error.server') as string
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
    return isEmpty(data) 
      ? { status, message }
      : { status, message, data: this.mapDataToEntityName(data) } as object;
  }

  /**
   * @description Map the HTTP response data to entity name
   * 
   * @param {Object | Array<any>} data 
   * @returns object
   */
  private mapDataToEntityName (data: object | Array<any>): object {
    let key = this.getRespositoryService().getEntityName().toLowerCase();
    const { token, ...otherDetails } = data as any;
    const response: { [key: string]: any } = {};

     /**
      * Check if data is an array
      * We would pluralize it accordingly
      */ 
    if (Array.isArray(data)) {
      /**
       *  If the name of the entity ends with 'y',
       *  pluralize the key using 'ies'; otherwise, just add 's'
       */ 
      key = key.endsWith('y')
        ? `${key.substr(0, key.length)}ies` 
        : `${key}s`;
    }
    
    response[key] = otherDetails;
    return { ...response, token };
  }

  /**
   * @description Returns an HTTP response to the client
   * 
   * @param {Request} req
   * @param {Response} res 
   * @param {ResponseOptions<T>} options 
   * @returns void
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