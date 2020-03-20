import { getRepository, Repository } from 'typeorm';
import AbstractRepository from './AbstractRepository';
import { ITestimony } from '../types/Testimony';

export default class TestimonyRepository extends AbstractRepository<ITestimony> {
  protected readonly fillables: Array<string> = ['testimony', 'userId'];

  /**
   * Creates an instance TestimonyRepository.
   *
   * @memberof TestimonyRepository
   */
  public constructor() {
    super('Testimony');
  }

  getRepository(): Repository<ITestimony> {
    return getRepository(this.getEntityName());
  }
}
