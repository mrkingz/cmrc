import { Request, RequestHandler } from 'express';
import sendGrid from '@sendgrid/mail';

import configs from '../configs'
import { IUser } from '../interfaces/IEntity';
import AuthController from './AuthController';
import UserRepository from '../services/repositories/UserRepository';
import NotificationService from '../services/notifications/NotificationService';
import { Not } from 'typeorm';

sendGrid.setApiKey(configs.app.sendGridKey as string)

type Decoded = {
  id: string,
  isAdmin: boolean,
  exp: number,
}
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
   * @description Creates a singleton instance of UserController.
   * 
   * @param {NotificationService} notifier the notification service instance
   * @param {UserRepository} repository the repository service instane
   * @memberof UserController
   */
  constructor(notifier: NotificationService, repository: UserRepository) {
    super(notifier, repository);

    // We force the constructor to always return a singleton
    UserController.singleton = !!UserController.singleton
      ? UserController.singleton
      : this;
    
    return UserController.singleton;   
  }

  /**
   * @description Gets all registered users
   *
   * @returns
   * @memberof UserController
   */
  public getUsers () {
    return this.tryCatch(async (req: Request) => {
      const data = await this.getRepository().paginate({ 
        select: this.getRepository().getSelectables(),
        where: { id: Not(req.body.user.id) },
        page: req.query.page,
        limit: req.query.limit,
        sort: req.query.sort,
        sortBy: req.query.sortBy,
      });

      return this.getResponseData(data, this.getMessage('entity.list', 'users'));
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
        // Callback to check if user actually enters a different password
        // The callback throws an error if they match
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
      const { user, ...details } = req.body;
      let updates: { [key: string]: string} = {};
      Object.keys(details).forEach(key => { updates[key] = details[key]; });
     
      updates = await this.getRepository().validator(updates, {
        // skip other fillable fields that are not being updated
        skip: this.getRepository().getFillables().filter((field: string) => {
                return !Object.keys(updates).includes(field as string) 
              })
      }) as {};

      const updated = await this.getRepository().update({ id: user.id }, {
        ...updates, email: user.email, password: user.password
      });

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
