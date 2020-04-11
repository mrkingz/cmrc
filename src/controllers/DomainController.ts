import { RequestHandler, Request } from 'express';

import IResponse from '../types/Response';
import { IDomain } from '../types/Domain';
import CRUDController from './CRUDController';
import DomainService from '../services/DomainService';
import AbstractService from '../services/AbstractService';

/**
 * Controller that handles all domain http request and response
 *
 * @class DomainController
 * @extends {AbstractController<DomainService>}
 */
class DomainController extends CRUDController<IDomain> {
  /**
   * Creates an instance of DomainController.
   * 
   * @param {AbstractService<IPaperType>} service
   * @memberof DomainController
   */
  public constructor(service: AbstractService<IDomain>) {
    super(service);
  }

  /**
   * Create a new Domain
   *
   * @returns {RequestHandler}
   * @memberOf DomainController
   */
  public create(): RequestHandler {
    return this.tryCatch(
      async (req: Request): Promise<IResponse<IDomain>> => {
        const {
          params: { researchCategoryId },
          body: { domain },
        } = req;

        this.data = await this.getServiceInstance().create({ domain, researchCategoryId });

        return this.getResponse(
          this.getMessage(
            `entity.created`,
            this.getEntityName(),
          ),
          this.httpStatus.CREATED,
        );
      },
    );
  }
}

export default new DomainController(new DomainService());
