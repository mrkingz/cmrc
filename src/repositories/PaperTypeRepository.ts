import { Repository, getRepository } from 'typeorm';

import AbstractRepository from './AbstractRepository';
import { IPaperType } from '../types/PaperType';

export default class PaperTypeRepository extends AbstractRepository<IPaperType> {
  protected fillables: Array<string> = ['paperType', 'researchCategoryId'];

  /**
   * Creates an instance of PaperTypeRepository
   *
   * @returns PaperTypeRepository
   */
  public constructor() {
    super('PaperType');
  }

  public getRepository(): Repository<IPaperType> {
    return getRepository(this.getEntityName());
  }
}
