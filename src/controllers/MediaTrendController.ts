import {RequestHandler, Request} from "express";

import CRUDController from "./CRUDController";
import {IMediaTrend} from "../types/MediaTrend";
import IResponseData from "../types/ResponseData";
import AbstractService from "../services/AbstractService";
import MediaTrendService from "../services/MediaTrendService";

class MediaTrendController extends CRUDController<IMediaTrend> {

  /**
   *Creates an instance of ResearchController.
   * @memberof DisciplineController
   */
  public constructor(service: AbstractService<IMediaTrend>) {
    super(service);
  }

  /**
   * Create a new Discipline
   *
   * @returns {RequestHandler}
   * @memberOf DisciplineController
   */
  public create (): RequestHandler {
    return this.tryCatch(async (req: Request): Promise<IResponseData<IMediaTrend>> => {
      const {
        params: { researchCategoryId },
        body: { mediaTrend }
      } = req;

      const newMediaTrend: IMediaTrend = await this.getServiceInstance().create({ mediaTrend, researchCategoryId });

      return this.getResponseData(
        newMediaTrend,
        this.getMessage(`entity.created`, this.getServiceInstance().getRepository().getEntityName()),
        this.httpStatus.CREATED
      );
    })
  }
}

export default new MediaTrendController(new MediaTrendService());