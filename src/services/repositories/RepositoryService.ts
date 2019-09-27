import isEmpty from 'lodash.isempty';
import { getRepository, FindOneOptions, FindConditions } from 'typeorm';
import { validate, ValidationError } from 'class-validator';

import constants from '../../constants';
import UtilityService from '../utilities/UtilityService';
import { UpdateOptions, IValidatorOptions } from '../../interfaces/IEntity';

const { http } = constants;
export default class RespositoryService<T> extends UtilityService {

  /**
   * @description The name of an entity/database model
   *
   * @protected
   * @type {string}
   * @memberof RespositoryService<T>
   */
  private entityName: string;

  constructor (entityName: string) {
    super();
    this.entityName = entityName || '';

  }

  /**
   * @description Save a new instance/row of the entity
   * 
   * @param entity 
   * @returns {Promise<T>}
   */
  public async create (entity: T): Promise<T> {

    entity = this.getRepository().create(entity) as T;
    await this.validator(entity);

    const { ...data } = await this.getRepository().save(entity);
    
    return data;
  }

  /**
   * @description Find one instance of a en entity
   *
   * @protected
   * @param {ObjectType<T>} entity
   * @param {FindOneOptions<T>} options
   * @param {string} message error message if entity is not found
   * @returns
   * @memberof BaseController
   */
  public async findOneOrFail (options: FindOneOptions<T>, message?: string): Promise<T> {

    const { ...data } = await this.getRepository().findOne(options) as T;
    if (isEmpty(data)) {
      message = message || this.getLang('error.notFound') as string;
      throw this.rejectionError(message, http.NOT_FOUND);
    }
    return data;
  }

  /**
   * @description Gets the name of the entity
   * 
   * @returns {string} the name of the enitity
   * @memberof RespositoryService<T>
   */
  public getEntityName(): string {
    return this.entityName;
  }

  /**
   * @description Gets an instance of the entity's repository interface
   *
   * @private
   * @returns
   * @memberof RespositoryService
   */
  private getRepository() {
    return getRepository(this.getEntityName());
  }

  /**
   * @description Updates an entity
   *
   * @protected
   * @param {object} values
   * @param {string} [options] options
   * - options.message (optional) message to send if enitiy to update does not exist
   * - options.skip array of fields not to validate
   * @param {function} [callback] optional callback function before updating
   * @returns
   * @memberof BaseController
   */
  public async update (condition: FindConditions<T>, values: T, options: UpdateOptions = {},  callback?: Function): Promise<T> {
    const message = options.message || this.getLang('error.invalid', this.getEntityName()) as string
    const entity: { [key: string]: string } = await this.findOneOrFail(condition, message as string) as {};

    if (typeof callback === 'function') {
      callback(entity);
    }
    await this.validator(this.getRepository().create(values) as T, { skip: options.skip });
    await this.getRepository().update({ id: entity.id }, values);
    const updates: T = this.getRepository().merge(entity, values) as T;

    return updates;
  }

  public createProps (fields: T) {
    return this.getRepository().create(fields)
  }

  /**
   * @description Validate form fields
   * 
   * @param {T} entity the database entity
   * @param {ValidatorOptions} [options] validation options
   * - options.skip array of fields not to validate
   * @returns {Object} the validation response
   */
  public async validator (entity: T, options: IValidatorOptions = {}): Promise<T> {
    const { skip, ...extraOptions } = options
    let error = await validate(entity, { 
      whitelist: true, 
      forbidNonWhitelisted: true,
      skipMissingProperties: true,
      ...extraOptions
    });

    if (error.length > 0) {
      let sk = skip || []
      const errors: { [key: string]: string } = {};
      error.forEach((error: ValidationError) => {
        // check for skipped fields
        if (!sk.includes(error.property)) {
          errors[error.property] = Object.values(error.constraints)[0] as string;
        }
      });

      if (!isEmpty(errors)) {
        throw this.rejectionError(errors, http.BAD_REQUEST);
      }
    }

    return entity;
  }
};
