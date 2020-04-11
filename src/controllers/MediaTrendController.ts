import { RequestHandler, Request } from 'express';

import IResponse from '../types/Response';
import CRUDController from './CRUDController';
import { IMediaTrend } from '../types/MediaTrend';
import AbstractService from '../services/AbstractService';
import MediaTrendService from '../services/MediaTrendService';

/**
 * Controller that handles all media trend http request and response
 *
 * @class MediaTrendController
 * @extends {AbstractController<MediaTrendService>}
 */
class MediaTrendController extends CRUDController<IMediaTrend> {
  /**
   * Creates an instance of MediaTypeController.
   * 
   * @memberof MediaTypeController
   */
  public constructor(service: AbstractService<IMediaTrend>) {
    super(service);
  }

  /**
   * Create a new MediaType
   *
   * @returns {RequestHandler}
   * @memberOf MediaTypeController
   */
  public create(): RequestHandler {
    return this.tryCatch(
      async (req: Request): Promise<IResponse<IMediaTrend>> => {
        const {
          params: { researchCategoryId },
          body: { mediaTrend },
        } = req;

        this.data = await this.getServiceInstance().create({ mediaTrend, researchCategoryId });

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

export default new MediaTrendController(new MediaTrendService());
