import AbstractRepository from "../repositories/AbstractRepository";
import Utilities from "../utilities/Utilities";
import {DeleteResult, FindConditions, FindOneOptions, ObjectID} from "typeorm";
import isEmpty from "lodash.isempty";
import constants from "../constants";
import Validator from "../validations/Validator";
import { Pagination } from "../types/Pangination";
import { IFindConditions } from "../types/Repository";
import { isEqual, pick } from "lodash";

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
  public setBaseUrl (baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Gets the baseUrl
   *
   * @returns {string} the baseUrl
   * @memberOf AbstractService<T>
   */
  public getBaseUrl (): string {
    return this.baseUrl as string;
  }

  public abstract getRepository (): AbstractRepository<T>;

  /**
   * Checks if a value already exist
   *
   * @param {T} options the find conditions
   * @param {string} message optional message to return
   * @param {Function} predicate an optional function that returns a boolean
   * - Note: if predicate is provided, and its returns false, a duplicate/conflict exception is thrown
   * @returns {Promise<string>}
   * @memberOf AbstractService<T>
   */
  public async checkDuplicate (options: T, message?: string, predicate?: Function): Promise<boolean> {

    const data: T = await this.findOne(options as FindOneOptions<T>);

    if (isEmpty(data) || (typeof predicate === 'function' && predicate(data))) {
      return true;
    }

    throw this.error(
      message || this.getMessage('error.conflict', this.upperFirst(Object.keys(options)[0])),
      httpStatus.CONFLICT
    );
  }

  /**
   *Check if an entity was updated
   *
   * @param {Service} entity
   * @param {Service} updates
   * @memberOf AbstractService<T>
   */
  public checkUpdates (entity: T, updates: T) {
    const intersection = pick(entity as {}, Object.keys(updates));
    if (isEqual(intersection, updates)) {
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
  public async create (fields: T, callback?: Function): Promise<T> {

    if(typeof callback === 'function') {
      await callback();
    }

    return this.getRepository().save(fields);
  };

  /**
   * Deletes an instance of T
   *
   * @params {string} id
   * @memberOf AbstractService<T>
   */
  public async delete (id): Promise<void> {
    await this.findOne({ id } as FindOneOptions<T>);
    await this.getRepository().delete(id);
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
  public async findOne (options: FindOneOptions<T>): Promise<T> {
    const { ...data } = await this.getRepository().findOne(options) as T;
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
  public async findOneOrFail (options: FindOneOptions<T>, target?: string): Promise<T> {
    const { ...data } = await this.getRepository().findOne(options) as T;

    if (isEmpty(data)) {
      throw this.error(
        this.getMessage('error.notFound', target || this.getRepository().getEntityName()) as string,
         httpStatus.NOT_FOUND
      );
    }

    return data;
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

    return this.getRepository().update({ ...entity, ...updates })
  }
}