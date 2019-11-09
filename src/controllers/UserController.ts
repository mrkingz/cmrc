import { Not } from 'typeorm';
import isEmpty from 'lodash.isempty';
import sendGrid from '@sendgrid/mail';
import { Request, Response, RequestHandler, NextFunction } from 'express';

import configs from '../configs'
import { IUser } from '../interfaces/User';
import AuthController from './AuthController';
import IFileUploader from '../interfaces/FileUploader';
import Fileservice from '../services/upload/FileService';
import UserRepository from '../services/repositories/UserRepository';
import NotificationService from '../services/notifications/NotificationService';

sendGrid.setApiKey(configs.app.sendGridKey as string)

class UserController extends AuthController implements IFileUploader {

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
   * @description Overrides getFileUploader of IFileUploader
   *
   * @returns {Fileservice}
   * @memberof UserController
   */
  public getFileUploader (): Fileservice {
    return new Fileservice();
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

      return this.getResponseData(user, this.getMessage('entity.retrieved', 'Prifile'));
    });
  }

  /**
   * @description Gets all registered users
   *
   * @returns {RequestHandler}
   * @memberof UserController
   */
  public getUsers (): RequestHandler {
    return this.tryCatch(async (req: Request) => {
      // If status is defined in the query object, 
      // then filter users base on their account status; i.e., verified/unverified
      const status = req.query.status ? { isVerified: req.query.status } : {};

      const users = await this.getRepository().paginate({ 
        select: this.getRepository().getSelectable(),
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
   * @description Removes an uploaded profile photo
   *
   * @returns {RequestHandler}
   * @memberof UserController
   */
  public removePhoto (): RequestHandler {
    return this.tryCatch(async (req: Request) => {
      const user: IUser = await this.getRepository().update(
        { id: this.getAuthUser().id }, { photo: null }
      );
      
      await this.getFileUploader().deleteFile(this.getAuthUser().email as string);

      return this.getResponseData(user, this.getMessage('entity.file.removed', 'Profile photo'));
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
      const sortArray = sort ? sort.split(':') : [];

      const data = await (<UserRepository>this.getRepository()).getSearchClient().searchIndex({
        multi_match: {
          query: req.body.name,
          type: 'phrase_prefix',
          fields: ['firstName', 'lastName'] // search both fields
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
   * @description Overrides uploadFileToStorage of IFileUploader
   * 
   * @param {string} fileType the file type
   * @returns {RequestHandler}
   * @memberof UserController
   */
  public uploadFileToStorage (fileType: string): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const uploader: RequestHandler = await this.getFileUploader().uploadFile(
        this.getAuthUser().email as string, fileType
      ).single('photo');

      uploader(req, res, (error: Error) => {
        if (!req.file && !error) {
          return this.httpResponse(req, res, { 
            message: this.getMessage('error.file.required', 'photo'), 
            status: this.BAD_REQUEST 
          })
        }

        return error
          ? this.httpResponse(req, res, { 
              message: error.toString(), status: this.BAD_REQUEST 
            })
          : next();
      });
    };
  }

  /**
   * @description Saves an uploaded file URL
   *
   * @returns {RequestHandler}
   * @memberof UserController
   */
  public updateProfilePhotoURL (): RequestHandler {
    return this.tryCatch(async (req: Request) => {
      const file: {[key:string]: any} = req.file;
      const user: IUser = await this.getRepository().update(
        { id: this.getAuthUser().id }, { photo: decodeURIComponent(file.secure_url)}
      );

      return this.getResponseData(user, this.getMessage('entity.updated', 'Profile photo'));
    })
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
      const keys = Object.keys(updates);

      await this.getRepository().validator(updates, {
        // skip other fillable fields that are not being updated
        skip: this.getRepository().getFillable().filter((field: string) => {
                return !keys.includes(field as string) 
              })
      }) as {};

      const updated: IUser = await this.getRepository().update(
        { id: this.getAuthUser().id }, updates
      );

      return this.getResponseData(updated, this.getMessage('entity.updated', 'Profile'));
    });
  }
}

export default new UserController(
  new NotificationService(), new UserRepository()
);
