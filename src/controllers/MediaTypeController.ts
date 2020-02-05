import {RequestHandler, Request} from "express";

import CRUDController from "./CRUDController";
import {IMediaType} from "../types/MediaType";
import IResponseData from "../types/ResponseData";
import AbstractService from "../services/AbstractService";
import MediaTypeService from "../services/MediaTypeService";

class MediaTypeController extends CRUDController<IMediaType> {

  /**
   *Creates an instance of ResearchController.
   * @memberof DisciplineController
   */
  public constructor(service: AbstractService<IMediaType>) {
    super(service);
  }

  /**
   * Create a new Discipline
   *
   * @returns {RequestHandler}
   * @memberOf DisciplineController
   */
  public create (): RequestHandler {
    return this.tryCatch(async (req: Request): Promise<IResponseData<IMediaType>> => {
      const {
        params: { researchCategoryId },
        body: { mediaType }
      } = req;

      const newMediaType: IMediaType = await this.getServiceInstance().create({ mediaType, researchCategoryId });

      return this.getResponseData(
        newMediaType,
        this.getMessage(`entity.created`, this.getServiceInstance().getRepository().getEntityName()),
        this.httpStatus.CREATED
      );
    })
  }
}

export default new MediaTypeController(new MediaTypeService());