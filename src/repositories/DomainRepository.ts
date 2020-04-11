import AbstractRepository from './AbstractRepository';
import { Repository, getRepository } from 'typeorm';
import { IDomain } from '../types/Domain';

export default class Domain extends AbstractRepository<IDomain> {
  protected fillables: Array<string> = ['domain', 'researchCategoryId'];

  constructor() {
    super('Domain');
  }

  getRepository(): Repository<IDomain> {
    return getRepository(this.getEntityName());
  }
}
