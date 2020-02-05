import {Not} from "typeorm";

import AbstractService from "./AbstractService";
import {IMediaType} from "../types/MediaType";
import AbstractRepository from "../repositories/AbstractRepository";
import MediaTypeRepository from "../repositories/MediaTypeRepository";

export default class MediaTypeService extends AbstractService<IMediaType> {
  public constructor() {
    super();
  }

  /**
   * Create a new of disciplne MediaType
   * 
   * @param {IMediaType} fields fields from request body
   * @returns {Promise<IMediaType>} a promise that resolves with the created instance
   * @memberof MediaTypeService
   */
  public create(fields: IMediaType): Promise<IMediaType> {
    return super.create(fields, () => this.checkDuplicate(
      { where: { mediaType: fields.mediaType }},
      this.getMessage(`error.duplicate`, fields.mediaType)
    ));
  }

  getRepository(): AbstractRepository<IMediaType> {
    return new MediaTypeRepository();
  }

  public async update(mediaType: IMediaType, fields: IMediaType): Promise<IMediaType> {
    const { mediaType: update } = fields;

    return super.update(
      mediaType, fields,
      async (data: IMediaType) => {
        await this.checkDuplicate({ where: { mediaType: update, id: Not(data.id) }},
          this.getMessage(`error.duplicate`, update))
      });
  }
}