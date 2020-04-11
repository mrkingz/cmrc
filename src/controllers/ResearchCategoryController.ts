import { RequestHandler, Request } from 'express';

import IResponse from '../types/Response';
import CRUDController from "./CRUDController";
import AbstractService from "../services/AbstractService";
import {IResearchCategory, ResearchType} from "../types/ResearchCategory";
import ResearchCategoryService from "../services/ResearchCategoryService";

/**
 * Controller that handles all research category http request and response
 *
 * @class ResearchCategoryController
 * @extends {AbstractController<ResearchCategoryService>}
 */
class ResearchCategoryController extends CRUDController<IResearchCategory> {
   /**
    * Creates an instance of ResearchCategoryController.
    *
    * @param {AbstractService<IPaperType>} service
    * @memberof ResearchCategoryController
    */
   constructor(service: AbstractService<IResearchCategory>) {
     super(service);
   }

  /**
   * Gets a specific service
   *
   * @returns {RequestHandler}
   * @memberof ResearchCategoryController
   */
  public findOneWithRelations(id: string, researchType: ResearchType, alias?: string): RequestHandler {
    return this.tryCatch(
      async (req: Request): Promise<IResponse<IResearchCategory>> => {
        const {
          params: { researchCategoryId },
        } = req;

        this.data = await (this.getServiceInstance() as ResearchCategoryService).findOneWithRelations(
          researchCategoryId,
          researchType,
        );

        return this.getResponse(
          this.getMessage(
            'entity.retrieved',
           this.getEntityName()
          ),
        );
      },
    );
  }
}

export default new ResearchCategoryController(new ResearchCategoryService());
