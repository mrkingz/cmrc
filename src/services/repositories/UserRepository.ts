import { getRepository } from 'typeorm';

import ISearch from '../../interfaces/Search';
import { IUser } from '../../interfaces/User';
import SearchClient from '../search/SearchClient';
import AbstractRepository from './AbstractRepository';

export default class UserRepository extends AbstractRepository<IUser> implements ISearch<IUser> {

  /**
   * @description A singleton of UserRepository.
   *
   * @private
   * @static
   * @type {UserRepository}
   * @memberof UserRepository
   */
  private static singleton: UserRepository;
  
  /**
   * @description  Array of fillable fields
   *
   * @protected
   * @type {Array<string>}
   * @memberof UserRepository
   */
  protected readonly fillables: Array<string> = [
    'firstName', 'lastName', 'email', 'password'
  ]; 

  /**
   * @description  Array of fields that cn be selected
   *
   * @protected
   * @type {Array<string>}
   * @memberof UserRepository
   */
  protected readonly selectables: Array<string> = [
    'id','firstName', 'lastName', 'email', 'isAdmin', 'photo', 'passwordReset',
    'rememberMeToken', 'phoneNumber', 'isVerified', 'createdAt', 'updatedAt'
  ]; 

  /**
   * @description Creates a singleton of UserRepository.
   * 
   * @memberof UserRepository
   */
  constructor () {
    super('User');

    return !!UserRepository.singleton
      ? UserRepository.singleton
      : this;
    
  }

  /**
   * @description Gets the repository connector 
   *
   * @protected
   * @returns
   * @memberof UserRepository
   */
  public getRepository () {
    return getRepository(this.getEntityName());
  }

  /**
   * @description Creates an instance of User repository
   *
   * @param {IUser} fields
   * @returns {IUser} instance of User repository
   * @memberof UserRepository
   */
  public create (fields: IUser): IUser {
    return this.getRepository().create(fields) as IUser;
  }

  /**
   * @description Overrides the getSearchClient ISearch interface
   *
   * @returns {SearchClient<IUser>}
   * @memberof UserRepository
   */
  public getSearchClient (): SearchClient<IUser> {
    return new SearchClient<IUser>(this);
  }
}
