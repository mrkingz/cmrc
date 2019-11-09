import isEmpty from 'lodash.isempty';
import {DeepPartial, DeleteResult, FindManyOptions, FindOneOptions, ObjectID, Repository} from 'typeorm';

import constants from '../constants';
import configs from '../configs/index';
import Utilities from '../utilities/Utilities';
import { IPaginationData, Pagination, PaginationMeta } from '../types/Pangination';
import {IFindConditions, Indexable} from '../types/Repository';
import IValidatable from "../interfaces/IValidatable";

const { httpStatus } = constants;


/**
 * 
 *
 * @export
 * @abstract
 * @class AbstractRepository
 * @extends {Utilities}
 * @template T
 */
export default abstract class AbstractRepository<T> extends Utilities implements IValidatable {


  private entityName: string;
  protected readonly fillables: Array<string> = [];
  protected readonly hidden: Array<string> = [];

  protected constructor(entityName: string) {
    super();
    this.entityName = entityName;
  }

  /**
   * Builds an instance of T
   *
   * @param {T} fields
   * @returns {T}
   * @memberof AbstractRepository
   */
  public build (fields?: T): T {
    return this.getRepository().create(fields as T);
  }

  /**
   * Computes pagination data
   *
   * @param {number} limit
   * @param {number} page
   * @returns {Promise<number>}
   * @memberof AbstractRepository
   */
  public async computePagination (limit: number, page: number): Promise<IPaginationData> {
    const { minItemsPerPage } = configs.api.pagination;

    const itemsPerPage: number = limit || minItemsPerPage;
    return {
      itemsPerPage,
      currentPage: page || 1,
      skip: itemsPerPage  * (( page || 1 ) - 1 )
    };
  }

  public async delete(criteria: ObjectID): Promise<DeleteResult>{
    return await this.getRepository().delete(criteria);
  }

  /**
   * Filter out the mass assignable/fillables fields
   *
   * @private
   * @returns {object}
   * @memberof AbstractRepository
   * @param {object} values
   */
  private filter (values: T): T {
    const fillables: T = this.getRepository().create();
    if (!isEmpty(this.getFillables())) {
      this.getFillables().forEach(value => {
        fillables[value] = values[value];
      });
    }

    return fillables;
  }

  public getPaginationMeta (total: number, itemsPerPage: number, currentPage: number): PaginationMeta {
    return {
      currentPage,
      itemsPerPage,
      totalItems: total,
      totalPage: Math.ceil(total/itemsPerPage ),       
    }
  }

  /**
   * Finds an instance of an entity
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
   * Gets the name of the entity/model
   * 
   * @returns {string} the name of the enitity
   * @memberof AbstractRepository<T>
   */
  public getEntityName (): string {
    return this.entityName;
  }

  /**
   * Gets the fillable properties. Subclass must return array of fillables
   *
   * @abstract
   * @returns {Array<string>}
   * @memberof AbstractRepository
   */
  public getFillables (): Array<string> {
    return this.fillables;
  }

  /**
   * Gets the array of fields not to include in the HTTP Rosponse JSON
   *
   * @abstract
   * @returns {Array<string>}
   * @memberof AbstractRepository
   */
  public getHiddenFields (): Array<string> {
    return this.hidden;
  }

  /**
   * Gets an instance of the entity's repository interface
   * Subclass should override this method to return
   *
   * @returns
   * @memberof AbstractRepository
   */
  public abstract getRepository (): Repository<T>;

  /**
   * Paginate response data
   *
   * @param {IFindConditions} findConditions the find conditions
   * @returns {Promise<any>}
   * @memberof AbstractRepository
   */
  public async find(findConditions: IFindConditions): Promise<Pagination<T>> {
    const { page, limit, sort, ...options } = findConditions;
    const order = sort ? (sort as string).split(':') : [];

    const { 
      skip, 
      itemsPerPage, 
      currentPage 
    } = await this.computePagination(Number(limit), Number(page));
    
    const [data, total] = await this.getRepository().findAndCount({
      ...options,
      skip,
      order: isEmpty(order) ? null : { [order[0]]: order[1].toUpperCase() },
      take: itemsPerPage
    } as  FindManyOptions<T>);

    return {
      data,
      pagination: this.getPaginationMeta(total, itemsPerPage, currentPage)
    }
  }

  /**
   * Saves a new instance/row of the entity
   * 
   * @param {T} fields the entity fields
   * @returns {Promise<T>}
   */
  public async save (fields: T): Promise<T> {
    const { ...data } = await this.getRepository().save(
      // Call create on the fields so Listeners/Subscribers can be triggered
      this.getRepository().create(this.filter(fields))
    );

    return data;
  }

  /**
   * Sets the name of the entity
   *
   * @param {string} entityName the name of a database entity/model
   * @memberof AbstractRepository
   */
  public setEntityName (entityName: string): void {
    this.entityName = entityName;
  }

  /**
   * @Override
   */
  public excludeFillables (fields: object): Array<string> {
     const { email, password, ...details } = fields as unknown as { [key: string]: string};

     const updates: { [key: string]: string} = {};
     Object.keys(details).forEach(key => { updates[key] = details[key]; });
     const keys = Object.keys(updates);

     return this.getFillables().filter((field: string) => {
       return !keys.includes(field as string)
     });
  }

  /**
   * Updates an entity of type T
   *
   * @param entity
   * @returns {Promise<T>} a promise that resolves with the updated instance
   */
  public async update (entity: T): Promise<T> {
    // Build on the updated fields so Listeners/Subscribers can be triggered
    return this.getRepository().save(this.getRepository().create(entity));
  }
}
