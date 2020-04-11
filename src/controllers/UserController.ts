import { isEmpty } from 'lodash';
import { Request, RequestHandler, NextFunction, Response } from 'express';

import { IUser } from '../types/User';
import IResponse from 'src/types/Response';
import CRUDController from "./CRUDController";
import UserService from "../services/UserService";
import AbstractService from '../services/AbstractService';

/**
 * Controller that handles all User http request and response
 *
 * @class UserController
 * @extends {AbstractController<UserService>}
 */
class UserController extends CRUDController<IUser> {
  protected readonly VERIFICATION: string = 'verification';
  protected readonly PASSWORD: string = 'password';
  protected readonly AUTHENTICATION: string = 'authentication';

  /**
   * Creates a singleton instance of UserController.
   * 
   * @param {AbstractService<IPaperType>} service
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
      async (req: Request): Promise<IResponse<IUser>> => {
        this.data = await (this.getServiceInstance() as UserService).accountVerification(req.params.token);

        return this.getResponse(this.getMessage('email.verified'));
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
        req['decoded'] = await (this.getServiceInstance() as UserService).checkAuthentication(
          this.extractToken(req),
        );

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
      async (req: Request): Promise<IResponse<IUser>> => {
        const {
          params: { [param]: userId },
        } = req;
        this.data = await (this.getServiceInstance() as UserService).getProfile(userId, this.getAuthUser(req));

        return this.getResponse(this.getMessage('entity.retrieved', 'Profile'));
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
      async (req: Request): Promise<IResponse<IUser>> => {

        this.data = await (this.getServiceInstance() as UserService).find({
          ...this.getPaginationParams(req),
          status: Boolean(req.query.status)
        });

        return this.getResponse(
          this.getMessage(
            isEmpty(this.data) ? `entity.emptyList` : `entity.retrieved`,
            this.getEntityName()
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
      async (req: Request): Promise<IResponse<IUser>> => {
        this.data= await (this.getServiceInstance() as UserService).search(
          {
            query: req.query.name as string,
            fields: ['firstName', 'lastName'],
          },
          this.getPaginationParams(req)
        );

        return this.getResponse();
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
        return this.getResponse(this.getMessage(`email.${this.PASSWORD}.message`));
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
      async (req: Request): Promise<IResponse<IUser>> => {
        const {
          body: { email, password },
        } = req;

        const { token, message } = await (this.getServiceInstance() as UserService).authentication({ email, password });
        this.data = { token: token as string }
        
        return this.getResponse(message, token ? this.httpStatus.UNAUTHORIZED : this.httpStatus.OKAY)
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
      async (req: Request): Promise<IResponse<IUser>> => {
        this.getServiceInstance().setBaseUrl(this.getBaseUrl(req));

        this.data = await this.getServiceInstance().create(req.body);

        return this.getResponse(
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
      async (req: Request): Promise<IResponse<IUser>> => {
        const {
          body: { password },
          params: { token },
        } = req;

        await (this.getServiceInstance() as UserService).updatePassword(token, password);

        return this.getResponse(this.getMessage('entity.updated', `Password`));
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
      async (req: Request): Promise<IResponse<IUser>> => {
        const {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          body: { email, password, ...updates },
        } = req;

        const updated: IUser = await this.getServiceInstance().update(this.getAuthUser(req), updates);
        this.data = { ...this.getAuthUser(req), ...updated };

        return this.getResponse(
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
      async (req: Request): Promise<IResponse<IUser>> => {
        this.data = await (this.getServiceInstance() as UserService).removePhoto(this.getAuthUser(req));

        return this.getResponse(this.getMessage('entity.file.removed', 'Profile photo'));
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
      async (req: Request): Promise<IResponse<IUser>> => {
        const updatedUser: IUser = await this.getServiceInstance().update(
          { id: this.getAuthUser(req).id },
          { photo: decodeURIComponent(req.file['secure_url']) },
        );
        this.data = { ...this.getAuthUser(req), ...updatedUser };

        return this.getResponse(
          this.getMessage('entity.updated', 'Profile photo'),
        );
      },
    );
  }
}

export default new UserController(new UserService());
