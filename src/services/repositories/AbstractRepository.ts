import isEmpty from 'lodash.isempty';
import { FindOneOptions, FindConditions } from 'typeorm';
import { validate, ValidationError } from 'class-validator';

import constants from '../../constants';
import UtilityService from '../utilities/UtilityService';
import { UpdateOptions, IValidatorOptions } from '../../interfaces/IEntity';

const { status } = constants;

/**
 * 
 *
 * @export
 * @abstract
 * @class AbstractRepository
 * @extends {UtilityService}
 * @template T
 */
export default abstract class AbstractRepository<T> extends UtilityService {

  /**
   * @description The name of an entity/database model
   *
   * @protected
   * @type {string}
   * @memberof AbstractRepository<T>
   */
  private entityName: string;

  /**
   * @description Array of fillable fields
   *
   * @protected
   * @type {Array<string>}
   * @memberof AbstractRepository
   */
  protected readonly fillables: Array<string>;

  constructor (entityName: string) {
    super();
    this.entityName = entityName;
    this.fillables = [];
  }

  /**
   * @description Creates an insatnce of Repository
   *
   * @param {T} fields
   * @returns {T}
   * @memberof AbstractRepository
   */
  public abstract create (fields: T): T;

  /**
   * @description Save a new instance/row of the entity
   * 
   * @param entity 
   * @returns {Promise<T>} the created entity
   */
  public async save (entity: T): Promise<T> {
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

      throw this.rejectionError(message, status.NOT_FOUND);
    }

    return data;
  }

  /**
   * @description Finds an instance of an entity
   *
   * @param {FindOneOptions} options the find conditions
   * @returns {Promise<T>} the found entity of null
   * @memberof AbstractRepository
   */
  public async findOne (options: FindOneOptions<T>): Promise<T> {
    const { ...data } = await this.getRepository().findOne(options) as T;
    return data; 
  }

  /**
   * @description Gets an instance of the entity's repository interface
   * Subclass should override this method to return
   *
   * @private
   * @returns
   * @memberof AbstractRepository
   */
  public abstract getRepository (): any;

  /**
   * @description Gets the fillable properties. Subclass must return array of fillables
   *
   * @abstract
   * @returns {Array<string>}
   * @memberof AbstractRepository
   */
  public  getFillables (): Array<string> {
    return this.fillables;
  }

  /**
   * @description Gets the name of the entity/model
   * 
   * @returns {string} the name of the enitity
   * @memberof AbstractRepository<T>
   */
  public getEntityName (): string {
    return this.entityName;
  }

  /**
   * @description Sets the name of the entity
   *
   * @param {string} entityName the name of a database entity/model
   * @memberof AbstractRepository
   */
  public setEntityName (entityName: string): void {
    this.entityName = entityName;
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
  public async update (condition: FindConditions<T>, updates: T, options: UpdateOptions = {},  callback?: Function): Promise<T> {
    const message = options.message || this.getLang('error.notFound', this.getEntityName()) as string;
    let entity: { [key: string]: string } = await this.findOneOrFail(condition, message as string) as {};

    if (typeof callback === 'function') {
      await callback(entity);
    }
    
    // Update the found entity with the incoming updates
    const updatedEntity = this.getRepository().merge(entity, updates) as T;

    await this.getRepository().update({ id: entity.id }, this.filter(updatedEntity as {}));

    return updatedEntity;
  }

  private filter (values: { [key: string]: string }): any {
    let fillables: { [key: string]: string } = {};
    if (!isEmpty(this.getFillables())) {
      this.getFillables().forEach(value => {
        fillables[value] = values[value];
      });
    } else {
      const { updatedAt, ...otherDetails } = values;
      fillables = otherDetails;
    }
    return fillables;
  }

  /**
   * @description Validate form fields
   * 
   * @param {T} entity the database entity
   * @param {ValidatorOptions} [options] validation options
   * - options.skip array of fields not to validate
   * @returns {Promise<T>} the validated fields to persist
   */
  public async validator (entity: T, options: IValidatorOptions = {}): Promise<T> {
    const { skip, ...extraOptions } = options

    entity = this.getRepository().create(entity) as T;

    let error = await validate(entity, { 
      whitelist: true, 
      forbidNonWhitelisted: true,
      skipMissingProperties: true,
      ...extraOptions
    });

    if (error.length > 0) {
      let sk = skip || [];
      const errors: { [key: string]: string } = {};
      
      error.forEach((error: ValidationError) => {
        // check for skipped fields
        if (!sk.includes(error.property)) {
          errors[error.property] = Object.values(error.constraints)[0] as string;
        }
      });

      if (!isEmpty(errors)) {
        throw this.rejectionError(errors, status.BAD_REQUEST);
      }
    }

    return entity;
  }
};
