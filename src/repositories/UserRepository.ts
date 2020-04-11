import { getRepository, Repository } from 'typeorm';

import { IUser } from '../types/User';
import SearchClient from '../vendors/search/SearchClient';
import AbstractRepository from './AbstractRepository';

export default class UserRepository extends AbstractRepository<IUser> {
  protected readonly fillables: Array<string> = ['firstName', 'lastName', 'email', 'password'];
  protected readonly hidden: Array<string> = ['password', 'resetStamp'];

  /**
   * Creates a singleton of UserRepository.
   *
   * @memberof UserRepository
   */
  public constructor() {
    super('User');
  }

  /**
   * Gets the repository connector
   *
   * @returns an instance of Repository<IUser>
   * @memberof UserRepository
   */
  public getRepository(): Repository<IUser> {
    return getRepository(this.getEntityName());
  }

  /**
   * Overrides the getSearchClient ISearch interface
   *
   * @returns an instance of SearchClient<IUser>
   * @memberof UserRepository
   */
  public getSearchClient(): SearchClient<IUser> {
    return new SearchClient<IUser>(this);
  }
}
