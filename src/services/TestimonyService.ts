import AbstractService from './AbstractService';
import { ITestimony } from '../types/Testimony';
import AbstractRepository from '../repositories/AbstractRepository';
import TestimonyRepository from '../repositories/TestimonyRepository';

class TestimonyService extends AbstractService<ITestimony> {
  public constructor() {
    super();
  }

  getRepository(): AbstractRepository<ITestimony> {
    return new TestimonyRepository();
  }
}

export default TestimonyService;
