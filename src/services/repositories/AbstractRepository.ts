import isEmpty from 'lodash.isempty';
import { FindOneOptions, FindConditions, Repository } from 'typeorm';
import { validate, ValidationError } from 'class-validator';

import constants from '../../constants';
import configs from '../../configs/index';
import UtilityService from '../utilities/UtilityService';
import { IPaginationData } from '../../interfaces/Pangination';
import { IValidatorOptions, IFindConditions } from '../../interfaces/Repository';

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
   * @description Array of fillable fields. Subclass should override this property 
   * with a list of fillable fields
   *
   * @protected
   * @type {Array<string>}
   * @memberof AbstractRepository
   */
  protected readonly fillable: Array<string> = [];

  /**
   * @description List of selectable fields. Subclass should override this property 
   * with a list of selectable fields
   *
   * @protected
   * @type {Array<string>}
   * @memberof AbstractRepository
   */
  protected readonly selectable: Array<string> = [];

  /**
   * @description List of fields not to include in JSON response to client. Subclass should 
   * override this property 
   * with a list of hiddens fields
   *
   * @protected
   * @type {Array<string>}
   * @memberof AbstractRepository
   */
  protected readonly hidden: Array<string> = [];

  constructor (entityName: string) {
    super();
    this.entityName = entityName;
  }

  /**
   * @description Builds an insatnce of Repository for validation
   *
   * @param {T} fields
   * @returns {T}
   * @memberof AbstractRepository
   */
  public abstract build (fields: T): any;

  /**
   * @description Filter out the mass assignable/fillable fields
   *
   * @private
   * @param {{ [key: string]: string }} values
   * @returns {*}
   * @memberof AbstractRepository
   */
  private filter (values: { [key: string]: string }): object {
    let fillables: { [key: string]: string } = {};
    if (!isEmpty(this.getFillable())) {
      this.getFillable().forEach(value => {
        fillables[value] = values[value];
      });
    }

    return fillables;
  }

  /**
   * @description Computes pagination data
   *
   * @private
   * @param {number} limit
   * @param {number} page
   * @returns {Promise<number>}
   * @memberof AbstractRepository
   */
  public async computePaginationData (limit: number, page: number): Promise<IPaginationData> {
    const { minItemsPerPage, maxItemsPerPage } = configs.api.pagination;
    let message!: string;

    if (limit < minItemsPerPage) {
      message = this.getMessage('error.pagination.minItems', `${minItemsPerPage}`);
    } else if (limit > maxItemsPerPage) {
      message = this.getMessage('error.pagination.maxItems', `${maxItemsPerPage}`);
    } else if (page <= 0) {
      message = this.getMessage('error.pagination.page');
    }

    if (message) {
      throw this.rejectionError(message);
    }

    const itemsPerPage: number = limit || minItemsPerPage;
    return {
      itemsPerPage,
      currentPage: page || 1,
      skip: itemsPerPage  * (( page || 1 ) - 1 )
    };
  }

  public getPaginationData (total: number, itemsPerPage: number, currentPage: number) {
    return {
      currentPage,
      itemsPerPage,
      totalItems: total,
      totalPage: Math.ceil(total/itemsPerPage ),       
    }
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
   * @description Find one instance of a en entity
   *
   * @protected
   * @param {ObjectType<T>} entity
   * @param {FindOneOptions<T>} options
   * @param {string} message error message if entity is not found
   * @returns
   * @memberof AbstractRepository
   */
  public async findOneOrFail (options: FindOneOptions<T>, message?: string): Promise<T> {

    const { ...data } = await this.getRepository().findOne(options) as T;
    if (isEmpty(data)) {
      message = message || this.getMessage('error.notFound', this.getEntityName()) as string;

      throw this.rejectionError(message, status.NOT_FOUND);
    }

    return data;
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
   * @description Gets the fillable properties. Subclass must return array of fillables
   *
   * @abstract
   * @returns {Array<string>}
   * @memberof AbstractRepository
   */
  public getFillable (): Array<string> {
    return this.fillable;
  }

  /**
   * @description Gets the array of fields not to include in the HTTP Rosponse JSON
   *
   * @abstract
   * @returns {Array<string>}
   * @memberof AbstractRepository
   */
  public getHiddenFields (): Array<string> {
    return this.hidden;
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
   * @description Gets an array of selectable fields
   *
   * @returns {Array<string>}
   * @memberof AbstractRepository
   */
  public getSelectable(): Array<string> {
    return this.selectable;
  }

  /**
   * @description Paginate response data
   *
   * @param {IPaginate} options
   * @returns {Promise<any>}
   * @memberof AbstractRepository
   */
  public async paginate(findConditions: IFindConditions): Promise<any> {
    let { page, limit, sort, sortBy, ...options } = findConditions;
    const order = sort ? (sort as string).split(':') : [];

    const { 
      skip, 
      itemsPerPage, 
      currentPage 
    } = await this.computePaginationData(Number(limit), Number(page));
    
    const [data, total] = await this.getRepository().findAndCount({
      ...options,
      skip,
      order: { [order[0]]: order[1].toUpperCase() },
      take: itemsPerPage
    });

    return { 
      data, 
      pagination: this.getPaginationData(total, itemsPerPage, currentPage)
    }
  }

  /**
   * @description Saves a new instance/row of the entity
   * 
   * @param fields the entity fields
   * @returns {Promise<T>}
   */
  public async save (fields: any): Promise<T> {
    const { ...data } = await this.getRepository().save(
      // Call create on the fields so Listeners/Subscribers can be triggered
      this.getRepository().create(this.filter(fields))
    );

    return data;
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
   * @param {object} values the values
   * @param {string} [message] optional message to send if entity to update does not exist
   * @param {function} [callback] optional callback function before updating
   * @returns {Promise<T>}
   * @memberof AbstractRepository
   */
  public async update (condition: FindConditions<T>, values: T, message?: string,  callback?: Function): Promise<T> {
    message = message || this.getMessage('error.notFound', this.getEntityName());
    const entity: T = await this.findOneOrFail(condition, message as string);

    if (typeof callback === 'function') {
      await callback(entity);
    }
    
    // Call create on the updated fields so Listeners/Subscribers can be triggered
    return await this.getRepository().save(
      this.getRepository().create({...entity, ...values })
    );
  }
  
  /**
   *
   *
   * @param {FindConditions<T>} condition
   * @param {T} values the values
   * @returns {Promise<T>}
   * @memberof AbstractRepository
   */
  public async updateOrCreate (condition: FindConditions<T>, values: T): Promise<T> {
    const entity: T = await this.findOne(condition);
    
    return isEmpty(entity) 
      ? await this.save({ ...condition, ...values })
      : await this.getRepository().save(
        // Call create on the updated fields so Listeners/Subscribers can be triggered
          this.getRepository().create({...entity, ...values })
        ); 
  }
  
  /**
   * @description Validate fields
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
