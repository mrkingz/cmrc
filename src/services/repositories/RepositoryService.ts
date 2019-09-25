import isEmpty from 'lodash.isempty';
import { getRepository, FindOneOptions } from 'typeorm';
import { validate, ValidationError, ValidatorOptions } from 'class-validator';

import UtilityService from '../utilities/UtitlityService';


export default class RespositoryService<T> extends UtilityService {

  /**
   * @description The name of an entity/database model
   *
   * @protected
   * @type {string}
   * @memberof EntityService
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
  public async findOneOrFail (options: FindOneOptions<T>, message: string): Promise<T> {

    const { ...data } = await this.getRepository().findOne(options) as T;
    if (isEmpty(data)) {
      throw this.rejectionError(message, 404);
    }
    return data;
  }

  /**
   * @description Gets the name of the entity
   * 
   * @returns {string} the name of the enitity
   * @memberof EntityService
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
   * @param {*} entity
   * @param {object} values
   * @param {string} [message] optional message to send
   * @returns
   * @memberof BaseController
   */
  public async update (entity: {[key: string]: string}, values: T, message?: string) {

    await this.validator(this.getRepository().create(values) as T);
    
    await this.getRepository().save({ id: entity.id }, values);
    const updates = this.getRepository().merge(entity, values) as T;

    return updates;
  }

  /**
   * @description Validate form fields
   * 
   * @param {T} entity the database entity
   * @param {ValidatorOptions} [options] validation options
   * @returns {Object} the validation response
   */
  protected async validator (entity: T, options?: ValidatorOptions): Promise<T> {

    const error = await validate(entity, { 
      ...options,
      whitelist: true, 
      forbidNonWhitelisted: true,
      skipMissingProperties: false
    });

    if (error.length > 0) {
      const errors: { [key: string]: string } = {};
      error.forEach((error: ValidationError) => {
        errors[error.property] = Object.values(error.constraints)[0] as string;
      });
      
      throw this.rejectionError(errors, 400);
    }

    return entity;
  }
};
