import { RequestHandler, Request } from 'express';

import { IDomain } from '../types/Domain';
import CRUDController from './CRUDController';
import IResponseData from '../types/ResponseData';
import DomainService from '../services/DomainService';
import AbstractService from '../services/AbstractService';

class DomainController extends CRUDController<IDomain> {
  /**
   *Creates an instance of ResearchController.
   * @memberof DisciplineController
   */
  public constructor(service: AbstractService<IDomain>) {
    super(service);
  }

  /**
   * Create a new Discipline
   *
   * @returns {RequestHandler}
   * @memberOf DisciplineController
   */
  public create(): RequestHandler {
    return this.tryCatch(
      async (req: Request): Promise<IResponseData<IDomain>> => {
        const {
          params: { researchCategoryId },
          body: { domain },
        } = req;

        const newDomain: IDomain = await this.getServiceInstance().create({ domain, researchCategoryId });

        return this.getResponseData(
          newDomain,
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

export default new DomainController(new DomainService());
