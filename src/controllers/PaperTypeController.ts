import { Request, RequestHandler } from 'express';

import { IPaperType } from '../types/PaperType';
import CRUDController from './CRUDController';
import IResponseData from '../types/ResponseData';
import AbstractService from '../services/AbstractService';
import PaperTypeService from '../services/PaperTypeService';

class PaperTypeController extends CRUDController<IPaperType> {
  public constructor(service: AbstractService<IPaperType>) {
    super(service);
  }

  public create(alias?: string): RequestHandler {
    return this.tryCatch(
      async (req: Request): Promise<IResponseData<IPaperType>> => {
        const {
          params: { researchCategoryId },
          body: { paperType },
        } = req;

        const newPaperType: IPaperType = await this.getServiceInstance().create({ paperType, researchCategoryId });

        return this.getResponseData(
          newPaperType,
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
}

export default new PaperTypeController(new PaperTypeService());
