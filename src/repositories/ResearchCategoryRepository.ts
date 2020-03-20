import AbstractRepository from './AbstractRepository';
import { IResearchCategory } from '../types/ResearchCategory';
import { Repository, getRepository } from 'typeorm';

export default class ResearchCategoryRepository extends AbstractRepository<IResearchCategory> {
  protected fillables: Array<string> = ['categoryName'];

  /**
   * Creates an instance of ResearchCategoryRepository
   *
   * @returns ResearchCategoryRepository
   */
  public constructor() {
    super('ResearchCategory');
  }

  /**
   * Gets the repository connector
   *
   * @returns {Repository<IResearchCategory>}
   * @memberof ResearchCategoryRepository
   */
  public getRepository(): Repository<IResearchCategory> {
    return getRepository(this.getEntityName());
  }
}
