import { Not } from 'typeorm';

import { IPaperType } from '../types/PaperType';
import AbstractService from './AbstractService';
import PaperTypeRepository from '../repositories/PaperTypeRepository';
import AbstractRepository from '../repositories/AbstractRepository';

export default class PaperTypeService extends AbstractService<IPaperType> {
  public constructor() {
    super();
  }

  /**
   * Create a new instance of PaperType
   *
   * @param fields the fields from request body
   * @returns {Promise<IPaperType>} a promise that resolvds the created instance
   * @memberof PaperTypeService
   */
  public create(fields: IPaperType): Promise<IPaperType> {
    return super.create(fields, () =>
      this.checkDuplicate(
        { where: { paperType: fields.paperType } },
        this.getMessage(`error.duplicate`, fields.paperType),
      ),
    );
  }

  getRepository(): AbstractRepository<IPaperType> {
    return new PaperTypeRepository();
  }

  public async update(paperType: IPaperType, fields: IPaperType): Promise<IPaperType> {
    const { paperType: update } = fields;

    return super.update(paperType, fields, async (data: IPaperType) => {
      await this.checkDuplicate(
        { where: { paperType: update, id: Not(data.id) } },
        this.getMessage(`error.duplicate`, update),
      );
    });
  }
}
