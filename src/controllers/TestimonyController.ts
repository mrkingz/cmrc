import { isEmpty } from 'lodash';
import { Request, RequestHandler } from 'express';

import IResponse from '../types/Response';
import CRUDController from './CRUDController';
import { ITestimony } from '../types/Testimony';
import AbstractService from '../services/AbstractService';
import TestimonyService from '../services/TestimonyService';

class TestimonyController extends CRUDController<ITestimony> {
  /**
   *Creates an instance TestimonyController.
   * @memberof TestimonyController
   */
  public constructor(service: AbstractService<ITestimony>) {
    super(service);
  }

  /**
   * Create a new Testimony
   *
   * @returns {RequestHandler} a function that takes an async callback that handles the POST request
   * @memberOf TestimonyController
   */
  public create(): RequestHandler {
    return this.tryCatch(
      async (req: Request): Promise<IResponse<ITestimony>> => {
        const {
          body: { testimony },
        } = req;
        this.data = await this.getServiceInstance().create({
          testimony,
          userId: this.getAuthUser(req).id,
        });

        return this.getResponse(
          this.getMessage(`entity.created`, this.getEntityName()),
          this.httpStatus.CREATED,
        );
      },
    );
  }

  /**
   * Finds and returns a paginated testimonies by their approval status
   *
   * @param {boolean} status the boolean value indicating the status of the testimony
   * @returns {RequestHandler} a function that takes an async callback that handles the GET request
   * @memberof TestimonyController
   */
  public findByApprovedStatus(status: boolean): RequestHandler {
    return this.tryCatch(async (req: Request): Promise<IResponse<ITestimony>> => {
      this.data = await (this.getServiceInstance() as TestimonyService).findByApprovedStatus(this.getPaginationParams(req), status);

      return this.getResponse(
        this.getMessage(
          isEmpty(this.data) ? `entity.emptyList` : `entity.retrieved`,
          `${(status ? 'Approved' : 'Unapproved')} ${this.getEntityName().toLowerCase()}`
        ),
      );
    })
  }

  /**
   * Updates the approved status of a testimony
   *
   * @returns {RequestHandler} a function that takes an async callback that handles the PUT request
   * @memberof TestimonyController
   */
  public update (): RequestHandler {
    return this.tryCatch(async (req: Request): Promise<IResponse<ITestimony>> => {
      const { body: { [this.foundRecordKey()]: entity }} = req;

      this.data = await this.getServiceInstance().update(entity, { approved: !entity.approved});

      return this.getResponse(this.getMessage(`entity.updated`, this.getEntityName()));
    });
  }
}

export default new TestimonyController(new TestimonyService());
