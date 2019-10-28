import { Not } from 'typeorm';
import isEmpty from 'lodash.isempty';
import sendGrid from '@sendgrid/mail';
import { Request, RequestHandler } from 'express';

import configs from '../configs'
import ISearch from '../interfaces/Search';
import { IUser } from '../interfaces/User';
import AuthController from './AuthController';
import UserRepository from '../services/repositories/UserRepository';
import NotificationService from '../services/notifications/NotificationService';

sendGrid.setApiKey(configs.app.sendGridKey as string)

class UserController extends AuthController {

  /**
   * @description A singleton of UserController.
   *
   * @private
   * @static
   * @type {UserController}
   * @memberof UserController
   */
  private static singleton: UserController;

  /**
   * @description Creates a singleton of UserController.
   * 
   * @param {NotificationService} notifier the notification service instance
   * @param {UserRepository} repository the repository service instane
   * @memberof UserController
   */
  constructor(notifier: NotificationService, repository: UserRepository) {
    super(notifier, repository);

    // We force the constructor to always return a singleton
    return !!UserController.singleton
      ? UserController.singleton
      : this;   
  }

  /**
   * @description Gets all registered users
   *
   * @returns
   * @memberof UserController
   */
  public getUsers (): RequestHandler {
    return this.tryCatch(async (req: Request) => {
      // If status is defined in the query object, 
      // then filter users base on their account status; i.e., verified/unverified
      const status = req.query.status ? { isVerified: req.query.status } : {};

      const users = await this.getRepository().paginate({ 
        select: this.getRepository().getSelectables(),
        where: { id: Not(this.getAuthUser().id), ...status },
        page: req.query.page,
        limit: req.query.limit,
        sort: req.query.sort
      });

      return this.getResponseData(users, 
        this.getMessage(isEmpty(users.data) ? `entity.emptyList` : `entity.retrieved`, `Users`)
      );
    });
  }

  /**
   * @description Gets user profile details
   *
   * @returns {RequestHandler}
   * @memberof UserController
   */
  public getProfile (): RequestHandler {
    return this.tryCatch(async (req: Request) => {
      let user: IUser;
      
      /*
       * If user is the authenticated user
       * then, id from params must match the id of the authenticated user
       */ 
      if (this.getAuthUser().id === req.params.userId) {
        user = this.getAuthUser();
      } 
      /*
       * If id from params does not match,
       * Check if user is admin, as only admin can view other user's profile
       * Otherwise, throw an unauthorized message
       */
      else if (this.getAuthUser().isAdmin) {
        user = await this.getRepository().findOneOrFail({ id: req.params.userId } as {});
      } else {
        throw this.rejectionError(this.getMessage('error.unauthorized'), this.UNAUTHORIZED);
      }

      return this.getResponseData(
        this.removePasswordFromUserData(user),
        this.getMessage('entity.retrieved', 'Prifile')
      );
    });
  }

  /**
   * @description Search users by first or last name
   *
   * @returns {RequestHandler}
   * @memberof UserController
   */
  public searchUsers (): RequestHandler {
    return this.tryCatch(async (req: Request): Promise<object> => {
      const {page, limit, sort } = req.query;
      const sortArray = sort ? sort.split(':') : []
      const data = await this.getRepository().getSearchClient().searchIndex({
        multi_match: {
          query: req.body.name,
          type: 'phrase_prefix',
          fields: ['firstName', 'lastName']
        }
      }, {
        limit, page, sort: sort ? [{
          [`${sortArray[0]}.keyword`]: { order: `${sortArray[1]}`}
        }] : [],
      });

      return this.getResponseData(data);
    });
  }

  /**
   * @description Sign up a new user
   * 
   * @returns {Function}
   * @memberof AuthController
   */
  public signUp (): RequestHandler {
    return this.tryCatch(async (req: Request): Promise<object> => {
      this.setBaseURL(req);
      await this.getRepository().validator(req.body);

      const user: IUser = await this.getRepository().save({
        ...req.body,
        password: this.hashPassword(req.body.password) 
      });

      // Create search index, so users can be searched by names
      await this.getRepository().getSearchClient().createIndex({ 
        id: user.id, firstName: user.firstName, lastName: user.lastName 
      });
 
      this.sendEmailNotification(user, this.VERIFICATION);

      return this.getResponseData(
        this.removePasswordFromUserData(user), 
        this.getMessage(`email.${this.VERIFICATION}.message`), 
        this.CREATED
      );
    });
  }

  /**
   * @description Updates password
   *
   * @returns {Function}
   * @memberof UserController
   */
  public updatePassword (): RequestHandler {
    return this.tryCatch(async (req: Request) => {
      const { password } = req.body;
      const { id } = await this.validateToken(req.params.token, this.PASSWORD);

      await this.getRepository().validator({ password }, { 
        skip: ['firstName', 'lastName', 'email'], // Skip these fields during validation
      });

      const updatedUser = await this.getRepository().update(
        { id }, 
        { passwordReset: false, password: this.hashPassword(password as string) },
        this.getMessage(`error.${this.PASSWORD}.invalid`),
        /*
         * Callback to check if user actually enters a different password
         * The callback throws an error if they match
         */ 
        async (user: IUser) => {
          if (user.passwordReset) { // false, if link has already been used
            throw this.rejectionError(this.getMessage(`error.${this.PASSWORD}.used`), this.UNAUTHORIZED)
          } else if (this.confirmPassword(password, user.password as string, 
              this.getMessage(`error.required`, this.PASSWORD))) {
            throw this.rejectionError(this.getMessage(`error.${this.PASSWORD}.same`), this.UNAUTHORIZED);
          }
        }
      );

      return this.getResponseData(
        this.removePasswordFromUserData(updatedUser),
        this.getMessage('entity.updated', this.capitalizeFirst(this.PASSWORD))
      )
    });
  }

  /**
   * @description Update profile details
   *
   * @returns {Function}
   * @memberof UserController
   */
  public updateProfile (): RequestHandler {
    return this.tryCatch(async (req: Request) => {
      // prevent updating email and password
      const { email, password, ...details } = req.body;

      let updates: { [key: string]: string} = {};
      Object.keys(details).forEach(key => { updates[key] = details[key]; });
      
      updates = await this.getRepository().validator(updates, {
        // skip other fillable fields that are not being updated
        skip: this.getRepository().getFillables().filter((field: string) => {
                return !Object.keys(updates).includes(field as string) 
              })
      }) as {};

      const updated: IUser = await this.getRepository().update({ id: this.getAuthUser().id }, updates);

      return this.getResponseData(
        this.removePasswordFromUserData(updated), 
        this.getMessage('entity.updated', 'Profile')
      );
    });
  }
}

export default new UserController(
  new NotificationService(), 
  new UserRepository()
);
