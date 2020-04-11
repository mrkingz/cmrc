import { RequestHandler, Request } from 'express';

import IResponse from '../types/Response';
import CRUDController from './CRUDController';
import { IMediaType } from '../types/MediaType';
import AbstractService from '../services/AbstractService';
import MediaTypeService from '../services/MediaTypeService';

/**
 * Controller that handles all media type http request and response
 *
 * @class MediaTypeController
 * @extends {AbstractController<MediaTypeService>}
 */
class MediaTypeController extends CRUDController<IMediaType> {
  /**
   * Creates an instance of MediaTypeController.
   * 
   * @param {AbstractService<IPaperType>} service
   * @memberof MediaTypeController
   */
  public constructor(service: AbstractService<IMediaType>) {
    super(service);
  }

  /**
   * Creates a new MediaType
   *
   * @returns {RequestHandler}
   * @memberOf MediaTypeController
   */
  public create(): RequestHandler {
    return this.tryCatch(
      async (req: Request): Promise<IResponse<IMediaType>> => {
        const {
          params: { researchCategoryId },
          body: { mediaType },
        } = req;

        this.data = await this.getServiceInstance().create({
          mediaType,
          researchCategoryId,
        });

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

export default new MediaTypeController(new MediaTypeService());
