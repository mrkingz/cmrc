import isEmpty from 'lodash.isempty';
import { FindOneOptions } from 'typeorm';
import { isEqual, pick } from 'lodash';

import constants from '../constants';
import Utilities from '../utilities/Utilities';
import { Pagination } from '../types/Pangination';
import { IFindConditions } from '../types/Repository';
import AbstractRepository from '../repositories/AbstractRepository';

const { httpStatus } = constants;

export default abstract class AbstractService<T> extends Utilities {
  private baseUrl?: string;

  protected constructor() {
    super();
  }

  /**
   * Sets the baseUrl
   *
   * @param {string} baseUrl the baseUrl
   * @memberOf AbstractService<T>
   */
  public setBaseUrl(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Gets the baseUrl
   *
   * @returns {string} the baseUrl
   * @memberOf AbstractService<T>
   */
  public getBaseUrl(): string {
    return this.baseUrl as string;
  }

  public abstract getRepository(): AbstractRepository<T>;

  /**
   * Checks if a value already exist
   *
   * @param {T} options the find conditions
   * @param {string} message optional message to return
   * @param {Function} predicate an optional function that returns a boolean
   * - Note: if predicate is provided, and its returns false, a duplicate/conflict exception is thrown
   * @returns {Promise<boolean>} returns true if duplicate is not found; otherwise throws an error
   * @memberOf AbstractService<T>
   */
  public async checkDuplicate(options: FindOneOptions<T>, message?: string, predicate?: Function): Promise<boolean> {
    const data: T = await this.findOne(options as T);
    if (isEmpty(data) || (typeof predicate === 'function' && predicate(data))) {
      return true;
    }

    throw this.error(message as string, httpStatus.CONFLICT);
  }

  /**
   *Check if an entity was updated
   *
   * @param {Service} entity
   * @param {Service} updates
   * @memberOf AbstractService<T>
   */
  public checkUpdates(entity: T, updates: T) {
    if (isEqual(pick(entity as {}, Object.keys(updates)), updates)) {
      throw this.error('', httpStatus.NOT_MODIFIED);
    }
  }

  /**
   * create a new entity
   *
   * @param {T} fields
   * @returns {Promise<T>}
   * @memberOf AbstractService<T>
   */
  public async create(fields: T, callback?: Function): Promise<T> {
    if (typeof callback === 'function') await callback(fields);

    return this.getRepository().save(fields);
  }

  /**
   * Deletes an instance of T
   *
   * @params {string} id
   * @memberOf AbstractService<T>
   */
  public async delete(entity: T): Promise<void> {
    await this.getRepository().delete(entity['id']);
  }

  /**
   * Finds all entity
   *
   * @param {IFindConditions} findConditions
   * @returns {Promise<Pagination<T>>}
   * @memberOf AbstractService<T>
   */
  public async find(findConditions: IFindConditions): Promise<Pagination<T>> {
    return this.getRepository().find(findConditions);
  }

  /**
   * Finds an entity
   *
   * @param {FindOneOptions<T>} options
   * @param {string} [message]
   * @returns {Promise<T>}
   * @memberof AbstractService
   */
  public async findOne(options: T): Promise<T> {
    const { ...data } = await this.getRepository().findOne(options);

    return data;
  }

  /**
   * Finds an entity. Returns the found entity or throw a not found error
   *
   * @param {FindOneOptions<T>} options
   * @param {string} [message]
   * @returns {Promise<T>}
   * @memberOf AbstractService<T>
   */
  public async findOneOrFail(options: FindOneOptions<T>, target?: string): Promise<T> {
    const { ...data } = await this.getRepository().findOne(options);

    if (isEmpty(data)) {
      throw this.error(
        this.getMessage('error.notFound', target || this.getRepository().getEntityName()) as string,
        httpStatus.NOT_FOUND,
      );
    }

    return data;
  }

  /**
   * Checks if an entity has relations
   *
   * @param conditions
   * @param {Array<string>} relations list of the relations to check
   * @returns {boolean} a promise that resolves with a boolean value
   * @memberof AbstractService
   */
  public async hasRelations(conditions: T, relations: string[]): Promise<boolean> {
    const result: T = await this.getRepository().findOne({
      where: conditions,
      relations: relations,
    });

    return relations.findIndex((relation: string) => !isEmpty(result[relation])) > -1;
  }

  /**
   * Update and entity
   *
   * @param {FindConditions<T>} condition
   * @param {T} updates
   * @param {string} message
   * @returns {Promise<T>}
   * @memberOf AbstractService<T>
   */
  public async update(entity: T, updates: T, callback?: Function): Promise<T> {
    if (typeof callback === 'function') {
      const result: T = await callback(entity);
      entity = isEmpty(result) ? entity : result;
    }

    await this.checkUpdates(entity, updates); // Check if there was an update on the values

    return this.getRepository().update({ ...entity, ...updates });
  }
}
