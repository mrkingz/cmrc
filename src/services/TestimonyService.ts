import AbstractService from './AbstractService';
import { ITestimony } from '../types/Testimony';
import AbstractRepository from '../repositories/AbstractRepository';
import TestimonyRepository from '../repositories/TestimonyRepository';
import { Pagination, PaginationParams } from 'src/types/Pagination';

class TestimonyService extends AbstractService<ITestimony> {
  public constructor() {
    super();
  }

  /**
   *
   *
   * @param {PaginationParams} paginationParams the pagination parameters
   * @param {boolean} status the approved status
   * @returns {Promise<Pagination<ITestimony>>}
   * @memberof TestimonyService
   */
  public async findByApprovedStatus(paginationParams: PaginationParams, status: boolean): Promise<Pagination<ITestimony>> {
    return this.find({ where: { approved: status  }, ...paginationParams });
  }

  /**
   * Creates the testimony repository instance
   *
   * @returns {AbstractRepository<ITestimony>}
   * @memberof TestimonyService
   */
  public getRepository(): AbstractRepository<ITestimony> {
    return new TestimonyRepository();
  }
}

export default TestimonyService;
