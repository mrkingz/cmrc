import isEmpty from 'lodash.isempty';
import { FindOneOptions } from 'typeorm';
import { Request, RequestHandler } from 'express';

import { Pagination } from '../types/Pangination';
import IResponseData from '../types/ResponseData';
import ValidationController from './ValidationController';
import AbstractService from '../services/AbstractService';
import { IUser } from '../types/User';

export default abstract class CRUDController<T> extends ValidationController<T> {
  protected constructor(service: AbstractService<T>) {
    super(service);
  }

  /**
   * Creates a new instance of T
   *
   * @returns {RequestHandler}
   * @memberof CRUDController
   */
  public create(alias?: string): RequestHandler {
    return this.tryCatch(
      async (req: Request): Promise<IResponseData<T>> => {
        const entity: T = await this.getServiceInstance().create(req.body);

        return this.getResponseData(
          entity,
          this.getMessage(
            `entity.created`,
            alias ||
              this.getServiceInstance()
                .getRepository()
                .getEntityName(),
          ),
          this.httpStatus.CREATED,
        );
      },
    );
  }

  /**
   * Finds one instance of T
   *
   * @param {string} param the id from request
   * @param {string} [alias]
   * @returns {RequestHandler}
   * @memberof CRUDController
   */
  public findOne(param: string, alias?: string): RequestHandler {
    return this.tryCatch(
      async (req: Request): Promise<IResponseData<T>> => {
        const {
          params: { [param]: id },
        } = req;

        const record: T = await this.getServiceInstance().findOneOrFail({ id } as FindOneOptions, alias);
        return this.getResponseData(
          record,
          this.getMessage(
            'entity.retrieved',
            alias ||
              this.getServiceInstance()
                .getRepository()
                .getEntityName(),
          ),
        );
      },
    );
  }

  /**
   * Retrieves paginated instances of T
   *
   * @param {string} [alias]
   * @returns {RequestHandler}
   * @memberof CRUDController
   */
  public find(alias?: string): RequestHandler {
    return this.tryCatch(
      async (req: Request): Promise<IResponseData<T>> => {
        const {
          query: { page, limit, sort },
        } = req;
        const records: Pagination<T> = await this.getServiceInstance().find({
          page,
          limit,
          sort,
        });

        return this.getResponseData(
          records,
          this.getMessage(
            isEmpty(records.data) ? `entity.emptyList` : `entity.retrievedList`,
            alias ||
              this.getServiceInstance()
                .getRepository()
                .getEntityName(),
          ),
        );
      },
    );
  }

  /**
   * Updates an instance of T
   *
   * @param {string} [alias]
   * @returns {RequestHandler}
   * @memberof CRUDController
   */
  public update(alias?: string): RequestHandler {
    return this.tryCatch(
      async (req: Request): Promise<IResponseData<T>> => {
        const {
          body: { [this.foundRecordKey()]: entity, ...updates },
        } = req;

        const updated: T = await this.getServiceInstance().update(entity, updates);

        return this.getResponseData(
          updated,
          this.getMessage(
            `entity.updated`,
            alias ||
              this.getServiceInstance()
                .getRepository()
                .getEntityName(),
          ),
        );
      },
    );
  }

  /**
   * Deletes an instance of T
   *
   * @param {string} [alias]
   * @returns {RequestHandler}
   * @memberof CRUDController
   */
  public delete(alias?: string): RequestHandler {
    return this.tryCatch(
      async (req: Request): Promise<IResponseData<T>> => {
        const {
          body: { [this.foundRecordKey()]: entity },
        } = req;

        await this.getServiceInstance().delete(entity);

        return this.getResponseData(
          {} as T,
          this.getMessage(
            `entity.deleted`,
            alias ||
              this.getServiceInstance()
                .getRepository()
                .getEntityName(),
          ),
          this.httpStatus.OKAY,
        );
      },
    );
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
}
