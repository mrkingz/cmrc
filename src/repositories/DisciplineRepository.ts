import {Repository, getRepository} from 'typeorm';

import {IResearchCategory} from '../types/ResearchCategory';
import {IDiscipline} from '../types/Discipline';
import AbstractRepository from './AbstractRepository';

export default class DisciplineRepository extends AbstractRepository<IDiscipline> {

  protected fillables: Array<string> = ['discipline', 'researchCategoryId'];

  /**
   * Creates an instance of DisciplineRepository
   *
   * @returns DisciplineRepository
   */
  public constructor() {
    super('Discipline');
  }

  public getRepository(): Repository<IResearchCategory> {
    return getRepository(this.getEntityName());
  }
}