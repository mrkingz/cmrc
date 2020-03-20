import { Request, RequestHandler } from 'express';

import CRUDController from './CRUDController';
import { ITestimony } from '../types/Testimony';
import IResponseData from '../types/ResponseData';
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
   * @returns {RequestHandler}
   * @memberOf TestimonyController
   */
  public create(): RequestHandler {
    return this.tryCatch(
      async (req: Request): Promise<IResponseData<ITestimony>> => {
        const {
          body: { testimony },
        } = req;
        const newTestimony: ITestimony = await this.getServiceInstance().create({
          testimony,
          userId: this.getAuthUser(req).id,
        });

        return this.getResponseData(
          newTestimony,
          this.getMessage(
            `entity.created`,
            this.getServiceInstance()
              .getRepository()
              .getEntityName(),
          ),
          this.httpStatus.CREATED,
        );
      },
    );
  }
}

export default new TestimonyController(new TestimonyService());
