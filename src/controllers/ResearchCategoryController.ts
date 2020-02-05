import { RequestHandler, Request } from "express";

import CRUDController from "./CRUDController";
import IResponseData from "src/types/ResponseData";
import AbstractController from "./AbstractController";
import AbstractService from "../services/AbstractService";
import {IResearchCategory, ResearchType} from "../types/ResearchCategory";
import ResearchCategoryService from "../services/ResearchCategoryService";

/**
 * Controller that handles all http request and response for vendors
 *
 * @class ResearchController
 * @extends {AbstractController<ResearchCategoryService>}
 */
class ResearchCategoryController extends CRUDController<IResearchCategory> {
   /**
    *Creates an instance of ResearchCategoryController.
    *
    * @returns {RequestHandler}
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
    return this.tryCatch(async (req: Request): Promise<IResponseData<IResearchCategory>> => {
      const { params: { researchCategoryId }} = req;

      const researchService: ResearchCategoryService = (this.getServiceInstance() as ResearchCategoryService);
      const researchCategory: IResearchCategory = await researchService.findOneWithRelations(researchCategoryId, researchType);

      return this.getResponseData(researchCategory,
        this.getMessage('entity.retrieved',
          alias ||  this.getServiceInstance().getRepository().getEntityName()));
    });
  }
}

export default new ResearchCategoryController(new ResearchCategoryService());