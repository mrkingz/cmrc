import { getRepository, FindConditions } from 'typeorm';
import { IUser, UpdateOptions } from '../../interfaces/IEntity';
import AbstractRepository from './AbstractRepository';
import { supportsReportingObserver } from '@sentry/utils';

export default class UserRepository extends AbstractRepository<IUser> {

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
   * @description Creates an singleton singleton of UserRepository.
   * 
   * @memberof UserRepository
   */
  constructor () {
    super('User');

    UserRepository.singleton = !!UserRepository.singleton
      ? UserRepository.singleton
      : this;
    
    return UserRepository.singleton;
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
    return getRepository(this.getEntityName()).create(fields) as IUser  ;
  }
}
