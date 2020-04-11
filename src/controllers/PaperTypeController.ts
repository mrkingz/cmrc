import { Request, RequestHandler } from 'express';

import IResponse from '../types/Response';
import { IPaperType } from '../types/PaperType';
import CRUDController from './CRUDController';
import AbstractService from '../services/AbstractService';
import PaperTypeService from '../services/PaperTypeService';

/**
 * Controller that handles all paper type http request and response
 *
 * @class PaperTypeController
 * @extends {AbstractController<PaperTypeService>}
 */
class PaperTypeController extends CRUDController<IPaperType> {
  /**
   * Creates an instance of PaperTypeController.
   * 
   * @param {AbstractService<IPaperType>} service
   * @memberof PaperTypeController
   */
  public constructor(service: AbstractService<IPaperType>) {
    super(service);
  }

  public create(alias?: string): RequestHandler {
    return this.tryCatch(
      async (req: Request): Promise<IResponse<IPaperType>> => {
        const {
          params: { researchCategoryId },
          body: { paperType },
        } = req;

        this.data = await this.getServiceInstance().create({ paperType, researchCategoryId });

        return this.getResponse(
          this.getMessage(
            `entity.created`,
            this.getEntityName()
          ),
          this.httpStatus.CREATED,
        );
      },
    );
  }
}

export default new PaperTypeController(new PaperTypeService());
