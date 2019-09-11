import ResponseOptionsInterface from '../interfaces/ResponseOptionsInterface';
import { Request, Response } from 'express';
import { getManager } from 'typeorm';
import { validate, ValidationError } from 'class-validator';
import app from '../setup/server';

abstract class BaseController<T> {

  protected model!: T;
  protected entityName: string;
  /**
   * @description Creates an Instance of BaseController
   * 
   * @param entityName 
   */
  constructor(entityName: string) {
    this.entityName = entityName || '';
  }
  
  /**
   * @description Gets the name of the entity
   * 
   * @returns {string} the name of the enitity
   */
  getEntityName(): string {
    return this.entityName;
  }

  /**
   * @description Validate form fields
   * 
   * @param {T} model the 
   * @returns {Object} the validation response
   */
  async validator (model: T) {
    const error = await validate(model, { whitelist: true, forbidNonWhitelisted: true });

    if (error.length > 0) {
      const errors: { [key: string]: string } = {};
      error.forEach((error: ValidationError) => {
        errors[error.property] = Object.values(error.constraints)[0] as string;
      })
      return { hasError: true, errors, status: 400 }
    }

    return { hasError: false }
  }

  /**
   * @description Save a new instance/row of the entity
   * 
   * @param model 
   * @returns {Object}
   */
  async saveEntity (model: T) {
    const { hasError, errors } = await this.validator(model)
    if (hasError) {
      throw errors;
    }

    const data = await getManager().save(model);
    
    return { 
      status: 201,
      message: `${this.getEntityName()} successfully created`,
      data: { [this.getEntityName().toLowerCase()]: data }
    }
  }

  /**
   * @description Returns an HTTP response to the client
   * 
   * @param {Request} req
   * @param {Response} res 
   * @param {ResponseOptionsInterface<T>} options 
   * @returns void
   */
  httpResponse (req: Request, res: Response, options: ResponseOptionsInterface<T>): void {
    let { keep, message, status, success, ...data } = options;

    status = status || 200;
    res.status(status).json({
      success: success || status < 400,
      message,
      ...data
    });
  }


  /**
   * @description Runs a callback function asynchronously
   *
   * @protected
   * @param {Function} callback
   * @returns {Promise<Function>} an asynchronous function
   * @memberof BaseController
   */
  protected asyncFunction (callback: Function) {
    return async (req: Request, res: Response): Promise<void> => {
      try {
        const { data, status, message } = await callback(req, res);
        this.httpResponse(req, res, { status, message, data })
      } catch (error) {
        res.status(error.status || 500).json({ 
          success: false,
          errors: app.get('env') === 'development' 
            ? error
            : 'Sorry, internal error occured, try again later!'
        })
      }
    }
  }
}

export default BaseController;