import { RequestHandler, Request } from 'express';

import IResponse from '../types/Response';
import CRUDController from './CRUDController';
import { IDiscipline } from '../types/Discipline';
import AbstractService from '../services/AbstractService';
import DisciplineService from '../services/DisciplineService';

/**
 * Controller that handles all discipline http request and response
 *
 * @class disciplineController
 * @extends {AbstractController<DisciplineService>}
 */
class DisciplineController extends CRUDController<IDiscipline> {
  /**
   * Creates an instance of DisciplineController.
   * 
   * @param {AbstractService<IPaperType>} service
   * @memberof DisciplineController
   */
  public constructor(service: AbstractService<IDiscipline>) {
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
      async (req: Request): Promise<IResponse<IDiscipline>> => {
        const {
          params: { researchCategoryId },
          body: { discipline },
        } = req;

        this.data = await this.getServiceInstance().create({ discipline, researchCategoryId });

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

export default new DisciplineController(new DisciplineService());
