import isEmpty from 'lodash.isempty';
import { FindOneOptions } from 'typeorm';
import { Request, RequestHandler } from 'express';

import { IUser } from 'src/types/User';
import IResponse from "../types/Response";
import { PaginationParams } from 'src/types/Pagination';
import ValidationController from "./ValidationController";
import AbstractService from "../services/AbstractService";

export default abstract class CRUDController<T> extends ValidationController<T> {
  protected constructor(service: AbstractService<T>) {
    super(service);
  }

  /**
   * Creates an instance of T
   *
   * @returns {RequestHandler} a function that takes an async callback that handles the POST request
   * @memberof CRUDController
   */
  public create(): RequestHandler {
    return this.tryCatch(async (req: Request): Promise<IResponse<T>> => {
      this.data = await this.getServiceInstance().create(req.body);

      return this.getResponse(
        this.getMessage(`entity.created`, this.getEntityName()),
        this.httpStatus.CREATED
      );
    });
  }

  /**
   * Finds an instance of T
   *
   * @param {string} param the find parameter
   * @param {string} [alias] alias for the found instance
   * @returns {RequestHandler} a function that takes an async callback that handles the GET request
   * @memberof CRUDController
   */
  public findOne (param: string, alias?: string): RequestHandler {
    return this.tryCatch(async (req: Request): Promise<IResponse<T>> => {
      const { params: { [param]: id }} = req;

      this.data = await this.getServiceInstance().findOneOrFail({ id } as FindOneOptions);

      return this.getResponse(
        this.getMessage('entity.retrieved',
          alias || this.getEntityName()));
    });
  }

  /**
   * Finds and returns paginated instances of T
   *
   * @param {string} [alias] an alias for the found instances
   * @returns {RequestHandler} a function that takes an async callback that handles the GET request
   * @memberof CRUDController
   */
  public find(alias?: string): RequestHandler {
    return this.tryCatch(async (req: Request): Promise<IResponse<T>> => {
      this.data = await this.getServiceInstance().find(this.getPaginationParams(req));

      return this.getResponse(
        this.getMessage(
          isEmpty(this.data) ? `entity.emptyList` : `entity.retrievedList`,
            alias || this.getEntityName()));
    });
  }

  /**
   * Updates an instance of T
   *
   * @param {string} [alias] an alias for the updated instance
   * @returns {RequestHandler} a function that takes an async callback that handles the PUT request
   * @memberof CRUDController
   */
  public update (alias?: string): RequestHandler {
    return this.tryCatch(async (req: Request): Promise<IResponse<T>> => {
      const { body: { [this.foundRecordKey()]: entity, ...updates }} = req;

      this.data = await this.getServiceInstance().update(entity, updates);

      return this.getResponse(
        this.getMessage(`entity.updated`,
          alias || this.getEntityName()));
    });
  }

  /**
   * Deletes an instance of T
   *
   * @param {string} [alias] an alias for the instance to delete
   * @returns {RequestHandler} a function that takes an async callback that handles the DELETE request
   * @memberof CRUDController
   */
  public delete (alias?: string): RequestHandler {
    return this.tryCatch(async (req: Request): Promise<IResponse<T>> => {
      const { body: { [this.foundRecordKey()]:  entity }} = req;

      await this.getServiceInstance().delete(entity);

      return this.getResponse(
        this.getMessage(`entity.deleted`,
          alias || this.getEntityName()),
        this.httpStatus.OKAY);
    });
  }

  /**
   * Gets the authenticated user
   *
   * @protected
   * @returns {T}
   * @memberof CRUDController<T>
   */
  protected getAuthUser(req: Request): IUser {
    return req['decoded'];
  }

  protected getEntityName(): string {
    return this.getServiceInstance().getRepository().getEntityName();
  }

  protected getPaginationParams (req: Request): PaginationParams {
    const {
      query: { page, limit, sort },
    } = req;

    return { page: parseInt(page as string), limit: parseInt(limit as string), sort: sort as string };
  }
}
