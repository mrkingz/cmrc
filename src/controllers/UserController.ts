import { isEmpty } from 'lodash';
import { Request, RequestHandler, NextFunction, Response } from 'express';

import { IUser } from '../types/User';
import CRUDController from './CRUDController';
import UserService from '../services/UserService';
import ResponseData from 'src/types/ResponseData';
import { Pagination } from '../types/Pangination';
import IResponseData from 'src/types/ResponseData';
import AbstractService from '../services/AbstractService';

class UserController extends CRUDController<IUser> {
  protected readonly VERIFICATION: string = 'verification';
  protected readonly PASSWORD: string = 'password';
  protected readonly AUTHENTICATION: string = 'authentication';

  /**
   * Creates a singleton instance of UserController.
   *
   * @param {UserRepository} repository the repository service instane
   * @memberof UserController
   */
  public constructor(service: AbstractService<IUser>) {
    super(service);
  }

  /**
   * Verifies registration
   *
   * @returns {RequestHandler}
   * @memberof UserController
   */
  public accountVerification(): RequestHandler {
    return this.tryCatch(
      async (req: Request): Promise<ResponseData<IUser>> => {
        const user = await (this.getServiceInstance() as UserService).accountVerification(req.params.token);

        return this.getResponseData(user, this.getMessage('email.verified'));
      },
    );
  }

  /**
   * Authenticate user with email and password
   *
   * @returns {RequestHandler}
   * @memberof UserController
   */
  public authenticateUser(): RequestHandler {
    return this.tryCatch(
      async (req: Request, res: Response, next: NextFunction): Promise<NextFunction> => {
        const user: IUser = await (this.getServiceInstance() as UserService).checkAuthentication(
          this.extractToken(req),
        );
        req['decoded'] = user;

        return next;
      },
    );
  }

  /**
   * Guard to check user authorization/privilege level
   *
   * @returns {RequestHandler}
   * @memberof UserController
   */
  public authorizeUser(): RequestHandler {
    return this.tryCatch(
      async (req: Request, res: Response, next: NextFunction): Promise<NextFunction> => {
        if (this.getAuthUser(req).isAdmin) {
          return next;
        }

        throw this.error(this.getMessage('error.unauthorized'), this.httpStatus.UNAUTHORIZED);
      },
    );
  }

  /**
   * Extracts the authentication token associated with the request
   *
   * @private
   * @param {Request} req the HTTP request object
   * @returns {string} the extracted token
   * @memberof UserController
   */
  private extractToken(req: Request): string {
    let token =
      req.headers['x-access-token'] ||
      req.headers['authorization'] ||
      req.cookies['x-access-token'] ||
      req.query['x-access-token'] ||
      req.body['x-access-token'];

    if (token) {
      const match = new RegExp('^Bearer').exec(token);
      token = match ? token.split(' ')[1] : token;
      return token.trim();
    }

    throw this.error(this.getMessage('authentication.token.notFound'), this.httpStatus.UNAUTHORIZED);
  }

  /**
   * Gets user profile details
   *
   * @returns {RequestHandler}
   * @memberof UserController
   */
  public findOne(param: string): RequestHandler {
    return this.tryCatch(
      async (req: Request): Promise<IResponseData<IUser>> => {
        const {
          params: { [param]: userId },
        } = req;
        const user: IUser = await (this.getServiceInstance() as UserService).getProfile(userId, this.getAuthUser(req));

        return this.getResponseData(user, this.getMessage('entity.retrieved', 'Profile'));
      },
    );
  }

  /**
   * @description Gets all registered users
   *
   * @returns {RequestHandler}
   * @memberof UserController
   */
  public find(alias?: string): RequestHandler {
    return this.tryCatch(
      async (req: Request): Promise<IResponseData<IUser>> => {
        const {
          query: { page, limit, sort, status },
        } = req;

        const users: Pagination<IUser> = await (this.getServiceInstance() as UserService).find({
          page,
          limit,
          sort,
          status,
        });

        return this.getResponseData(
          users,
          this.getMessage(
            isEmpty(users.data) ? `entity.emptyList` : `entity.retrieved`,
            alias ||
              `${this.getServiceInstance()
                .getRepository()
                .getEntityName()}`,
          ),
        );
      },
    );
  }

  /**
   * Search users by first or last name
   *
   * @returns {RequestHandler}
   * @memberof UserController
   */
  public searchUsers(): RequestHandler {
    return this.tryCatch(
      async (req: Request): Promise<IResponseData<IUser>> => {
        const {
          query: { page, limit, sort, name },
        } = req;

        const data: Pagination<IUser> = await (this.getServiceInstance() as UserService).search(
          {
            query: name,
            fields: ['firstName', 'lastName'],
          },
          { page, limit, sort },
        );

        return this.getResponseData(data);
      },
    );
  }

  /**
   * Sends a password reset email
   *
   * @returns {RequestHandler}
   * @memberof UserController
   */
  public sendPasswordResetLink(): RequestHandler {
    return this.tryCatch(
      async (req: Request): Promise<object> => {
        this.getServiceInstance().setBaseUrl(this.getBaseUrl(req));
        const {
          body: { email },
        } = req;

        await (this.getServiceInstance() as UserService).sendPasswordResetLink(email);
        return this.getResponseData({}, this.getMessage(`email.${this.PASSWORD}.message`));
      },
    );
  }

  /**
   * Sign in a registered user
   *
   * @returns {RequestHandler}
   * @memberof UserController
   */
  public signIn(): RequestHandler {
    return this.tryCatch(
      async (req: Request): Promise<IResponseData<IUser>> => {
        const {
          body: { email, password },
        } = req;

        const { token, message } = await (this.getServiceInstance() as UserService).authentication({ email, password });

        return isEmpty(token)
          ? this.getResponseData({}, message, this.httpStatus.UNAUTHORIZED)
          : this.getResponseData({ token: token as string }, message);
      },
    );
  }

  /**
   * Sign up a new user
   *
   * @returns {RequestHandler}
   * @memberof UserController
   */
  public signUp(): RequestHandler {
    return this.tryCatch(
      async (req: Request): Promise<IResponseData<IUser>> => {
        this.getServiceInstance().setBaseUrl(this.getBaseUrl(req));

        const user: IUser = await this.getServiceInstance().create(req.body);

        return this.getResponseData(
          user,
          this.getMessage(`email.${this.VERIFICATION}.message`),
          this.httpStatus.CREATED,
        );
      },
    );
  }

  /**
   * Updates password
   *
   * @returns {RequestHandler}
   * @memberof UserController
   */
  public updatePassword(): RequestHandler {
    return this.tryCatch(
      async (req: Request): Promise<IResponseData<IUser>> => {
        const {
          body: { password },
          params: { token },
        } = req;

        await (this.getServiceInstance() as UserService).updatePassword(token, password);

        return this.getResponseData({}, this.getMessage('entity.updated', `Password`));
      },
    );
  }

  /**
   * Update profile details
   *
   * @returns {Function}
   * @memberof UserController
   */
  public updateProfile(): RequestHandler {
    return this.tryCatch(
      async (req: Request): Promise<IResponseData<IUser>> => {
        const {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          body: { email, password, ...updates },
        } = req;

        const updated: IUser = await this.getServiceInstance().update(this.getAuthUser(req), updates);

        return this.getResponseData(
          { ...this.getAuthUser(req), ...updated },
          this.getMessage('entity.updated', 'Profile'),
        );
      },
    );
  }

  /**
   * Removes an uploaded profile photo
   *
   * @returns {RequestHandler}
   * @memberof UserController
   */
  public removePhoto(): RequestHandler {
    return this.tryCatch(
      async (req: Request): Promise<IResponseData<IUser>> => {
        const updatedUser: IUser = await (this.getServiceInstance() as UserService).removePhoto(this.getAuthUser(req));

        return this.getResponseData(updatedUser, this.getMessage('entity.file.removed', 'Profile photo'));
      },
    );
  }

  /**
   * Overrides uploadFileToStorage of IFileUploader
   *
   * @param {string} fileType the file type
   * @returns {RequestHandler}
   * @memberof UserController
   */
  public uploadFileToStorage(fileType: string): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const uploader: RequestHandler = await (this.getServiceInstance() as UserService).uploadFile(
        this.getAuthUser(req),
        fileType,
      );

      uploader(req, res, (error: Error) => {
        let message!: string;

        if (!req.file && !error) message = this.getMessage('error.file.required', 'photo');
        else if (error) message = error.toString();

        return message ? this.httpResponse(res, { message, status: this.httpStatus.BAD_REQUEST }) : next();
      });
    };
  }

  /**
   * Saves an uploaded file URL
   *
   * @returns {RequestHandler}
   * @memberof UserController
   */
  public updatePhotoURL(): RequestHandler {
    return this.tryCatch(
      async (req: Request): Promise<IResponseData<IUser>> => {
        const updatedUser: IUser = await this.getServiceInstance().update(
          { id: this.getAuthUser(req).id },
          { photo: decodeURIComponent(req.file['secure_url']) },
        );

        return this.getResponseData(
          { ...this.getAuthUser(req), ...updatedUser },
          this.getMessage('entity.updated', 'Profile photo'),
        );
      },
    );
  }
}

export default new UserController(new UserService());
