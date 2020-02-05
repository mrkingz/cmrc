import {Not} from "typeorm";

import AbstractService from "./AbstractService";
import {IMediaTrend} from "../types/MediaTrend";
import AbstractRepository from "../repositories/AbstractRepository";
import MediaTrendRepository from "../repositories/MediaTrendRepository";

export default class MediaTrendService extends AbstractService<IMediaTrend> {
  public constructor() {
    super();
  }

  /**
   * Create a new instance of MediaTrend
   * 
   * @param fields the fields from request body
   * @returns {Promise<IMediaTrend>} a promise that resolves with the created instance
   * @memberof MediaTrendService
   */
  public create(fields: IMediaTrend): Promise<IMediaTrend> {
    return super.create(fields, () => this.checkDuplicate(
      { where: { mediaTrend: fields.mediaTrend }},
      this.getMessage(`error.duplicate`, fields.mediaTrend)
    ));
  }

  getRepository(): AbstractRepository<IMediaTrend> {
    return new MediaTrendRepository();
  }

  public async update(mediaTrend: IMediaTrend, fields: IMediaTrend): Promise<IMediaTrend> {
    const { mediaTrend: update } = fields;

    return super.update(
      mediaTrend, fields,
      async (data: IMediaTrend) => {
        await this.checkDuplicate({ where: { mediaTrend: update, id: Not(data.id) }},
          this.getMessage(`error.duplicate`, update))
      });
  }
}