import bcrypt from 'bcryptjs';
import isEmpty from 'lodash.isempty';
import sendGrid from '@sendgrid/mail';
import { FindOneOptions } from 'typeorm';
import jwt, { VerifyOptions, SignOptions } from 'jsonwebtoken';
import { Request, RequestHandler, NextFunction } from 'express';

import configs from '../configs'
import { IUser } from '../interfaces/User';
import AbstractController from './AbstractController';
import UserRepository from '../services/repositories/UserRepository';
import { IEmailLangs, IMailOptions } from '../interfaces/Notification';
import NotificationService from '../services/notifications/NotificationService';
import AbstractRepository from '../services/repositories/AbstractRepository';

sendGrid.setApiKey(configs.app.sendGridKey as string)

type Decoded = {
  id: string,
  resetStamp: number,
  isAdmin: boolean,
  exp: number,
}
export default abstract class AuthController extends AbstractController<IUser> {

  /**
   * @description Identifies a verification notification languages, token type
   *
   * @protected
   * @type {string}
   * @memberof AuthController
   */
  protected readonly VERIFICATION: string = 'verification';

  /**
   * @description Identifies a password reset link notification languages, token type
   *
   * @protected
   * @type {string}
   * @memberof AuthController
   */
  protected readonly PASSWORD: string = 'password';

  /**
   * @description Identifies authentication languages
   *
   * @protected
   * @type {string}
   * @memberof AuthController
   */
  protected readonly AUTHENTICATION: string = 'authentication';

  /**
   * @description Instane of NotificationService to send notification
   *
   * @protected
   * @type {NotificationService}
   * @memberof AuthController
   */
  protected readonly notifier!: NotificationService;

  /**
   * @description Instance of RepositoryService to interface with the database
   *
   * @protected
   * @type {UserRepository}
   * @memberof AuthController
   */
  protected readonly repository: AbstractRepository<IUser>;

  private token!: string;

  /**
   * @description Creates a singleton instance of AuthController.
   * 
   * @param {NotificationService} notifier the notification service instance
   * @param {UserRepository} repository the repository service instane
   * @memberof AuthController
   */
  public constructor(notifier: NotificationService, repository: UserRepository) {
    super();
    this.notifier = notifier;
    this.repository = repository;
  }

  /**
   * @description Verifies registration
   *
   * @returns {Function}
   * @memberof AuthController
   */
  public accountVerification (): RequestHandler {
    return this.tryCatch(async (req: Request): Promise<object> => {
      
      const decoded = await this.validateToken(req.params.token, this.VERIFICATION);

      const updatedUser = await this.getRepository().update(
        { id: decoded.id }, 
        { isVerified: true }, 
        this.getMessage(`error.${this.VERIFICATION}.invalid`),
        /*
         * Callback function to check if email has been verified previously
         */
        (user: IUser) => {
          if (user.isVerified) {
            throw this.rejectionError(this.getMessage('error.verified'), this.UNAUTHORIZED);
          }
        }
      );

      return this.getResponseData(updatedUser, this.getMessage('email.verified'));
    });
  }

  /**
   * @description Authenticate user with email and password
   *
   * @returns {Function}
   * @memberof AuthController
   */
  public authenticateUser (): RequestHandler {
    return this.tryCatch(async (req: Request, res: Response, next: NextFunction) => {
      const { id } = this.decodeJWT(this.extractToken(req), {}, this.AUTHENTICATION);

      const { password, ...user } = await this.getRepository().findOneOrFail({ id } as {}); 
      this.setAuthUser(user);

      return next;
    });
  }

  /**
   * @description Guard to check user authorization/privilege level
   *
   * @returns {RequestHandler}
   * @memberof AuthController
   */
  public authorizeUser (): RequestHandler {
    return this.tryCatch(async (req: Request, res: Response, next: NextFunction) => {
      if (this.getAuthUser().isAdmin) {
        return next;
      }

      throw this.rejectionError(this.getMessage('error.unauthorized'), this.UNAUTHORIZED);
    });
  }

  /**
   * @description Confirms user's password during authentication
   *
   * @private
   * @param {string} password
   * @param {string} oldPassword
   * @returns {boolean}
   * @memberof AuthController
   */
  protected confirmPassword (password: string, oldPassword: string, message: string): boolean {
    try {
      return bcrypt.compareSync(password, oldPassword);
    } catch (error) {
      throw this.rejectionError(message, this.UNAUTHORIZED);
    }
  }

  /**
   * @description Check if email has been used
   *
   * @returns {Function}
   * @memberof AuthController
   */
  public checkIfUniqueEmail (): RequestHandler {
    return this.tryCatch(async (req: Request, res: Response, next: NextFunction): Promise<object> => {
      const email: string = req.body.email ? req.body.email.toLowerCase() : '';
      const data = await this.getRepository().findOne({ email } as FindOneOptions<IUser>);
      if (isEmpty(data)) {
        req.body.email = email
        return next;
      }  

      throw this.rejectionError(this.getMessage('error.conflict'), this.CONFLICT);
    });
  }

  /**
   * @description Decodes a JSON webtoken
   *
   * @private
   * @param {string} token
   * @param {object} configOptions
   * @param {string} tokenType
   * @returns {Decoded}
   * @memberof AuthController
   */
  private decodeJWT (token: string, configOptions: VerifyOptions, tokenType: string): Decoded {
    try {
      const { secret, issuer } = configs.app.jwt;
      return jwt.verify(token, secret as string, { issuer, ...configOptions }) as Decoded;
    } catch (error) {
      let message!: string;
      if (error.toString().indexOf('jwt expired') > -1) {
        message = this.getMessage(`error.${tokenType}.expired`);
      } else {
        message = this.getMessage(`error.${tokenType}.invalid`, tokenType);
      }

      throw this.rejectionError(message, this.UNAUTHORIZED);
    }
  }

  /**
   * @description Extracts the authentication token associated with the request
   *
   * @private
   * @param {Request} req the HTTP request object
   * @returns {string} the extracted token
   * @memberof AuthController
   */
  private extractToken (req: Request): string {
    let token = req.headers['x-access-token']
      || req.headers['authorization']
      || req.cookies['x-access-token'] 
      || req.query['x-access-token'] 
      || req.body['x-access-token'];

    if (token) {
      const match = new RegExp('^Bearer').exec(token);
      token = match ? token.split(' ')[1] : token;
      return token.trim();
    }

    throw this.rejectionError(this.getMessage('authentication.token.notFound'), this.UNAUTHORIZED);
  }
  
  /**
   * @description Generates a JSON Webtoken
   *
   * @private
   * @param {object} payload the token payload
   * @param {object } configOptions the optional configs
   * @returns {string}
   * @memberof AuthController
   */
  private generateJWT (payload: string | object, configOptions?: SignOptions): string {
    const { secret, issuer } = configs.app.jwt;
    return jwt.sign(payload, secret as string, { issuer, ...configOptions });
  }

  /**
   * @description Gets the notifier instance
   *
   * @private
   * @returns {NotificationService}
   * @memberof AuthController
   */
  private getNotifier (): NotificationService {
    return this.notifier;
  }

  /**
   * @description Generates notitifcation email body template
   *
   * @protected
   * @param {IUser} user
   * @param {string} emailType the type of email
   * @returns {IMailOptions} the email template
   * @memberof AuthController
   */
  private getMailBody(user: IUser, options: any, emailType: string): IMailOptions {

    const { 
      intro, subject, outro, instructions, text 
    } = this.getLang(`email.${emailType}`) as IEmailLangs

    return {
      subject,
      body: {
        name: `${user.firstName} ${user.lastName}`,
        intro,
        action: {
          instructions,
          button: {
            color: '#22BC66',
            text,
            link: this.generateLink(
                options ? { id: user.id as string, ...options } : { id: user.id as string }, 
                emailType
              )
          }
        },
        outro
      }
    };
  }


  /**
   * @description Generates links for email notifications 
   *
   * @private
   * @param {IUser} user the user
   * @param {string} emailType
   * @returns {string} The generated link
   * @memberof NotificationService
   */
  private generateLink (payload: {[key: string]: string}, emailType: string): string {
    const expiresIn = emailType === this.PASSWORD ? { expiresIn: '1d' } : {};
    this.token = this.generateJWT(payload, { 
      subject: emailType,
      ...expiresIn
    });

    return `${this.getBaseURL()}/auth/${emailType}/${this.token}`;
  }

  /**
   * @override method getRepositoryService in RespositoryService
   */
  protected getRepository(): AbstractRepository<IUser> {
    return this.repository;
  }

  /**
   * @description Sends email notification 
   * 
   * @param {IUser} user the receiver
   * @param {String} emailType the type of email notification
   */
  public sendEmailNotification(user: IUser, emailType: string, options?: any): void {
    this.getNotifier().sendEmail(user.email as string, this.getMailBody(user, options, emailType));
  }

  /**
   * @description Sends a password reset email 
   *
   * @returns {Function} 
   * @memberof AuthController
   */
  public sendPasswordResetLink (): RequestHandler {
    return this.tryCatch(async (req: Request): Promise<object> => {
      const { email } = req.body;
      this.setBaseURL(req);

      await this.getRepository().validator(
        this.getRepository().build({ email }) as IUser,
        { skip: ['firstName', 'lastName', 'password'] } // skip these fields
      );

      let user: IUser = await this.getRepository().findOneOrFail(
        { email: req.body.email } as object, 
        this.getMessage('error.notFound', this.getRepository().getEntityName())
      );
      
      const resetStamp: number = Date.now();
      user = await this.getRepository().update(
        { id: user.id}, { resetStamp }
      );
  
      this.sendEmailNotification(user, this.PASSWORD, { resetStamp });
      
      return this.getResponseData(user, this.getMessage(`email.${this.PASSWORD}.message`));
    });
  }

  /**
   * @description Sign in a registered user
   *
   * @returns {Function}
   * @memberof AuthController
   */
  public signIn (): RequestHandler {
    return this.tryCatch(async (req: Request) => {
      const { email, password } = req.body;
      const langKey = this.AUTHENTICATION;
      let message: string = this.getMessage(`${langKey}.${(email ? 'invalid' : 'required')}`);

      const user: IUser = await this.getRepository().findOneOrFail(
        { email } as FindOneOptions<IUser>, message
      );
      
      if (user.isVerified) {
        message = this.getMessage(`${langKey}.required`);
        if (this.confirmPassword(password, user.password as string, message)) { 
          
          return this.getResponseData( 
            { ...user, token: this.generateJWT({ id: user.id }) }, 
            this.getMessage(`${langKey}.success`)
          );
        }
        message = this.getMessage(`${langKey}.invalid`);
      } else {
        message = this.getMessage(`${langKey}.unverified`);
      }

      return this.getResponseData({}, message, this.UNAUTHORIZED);
    });
  }

  /**
   * @description Sign up a new user
   * 
   * @returns {RequestHandler}
   * @memberof AuthController
   */
  public signUp (): RequestHandler {
    return this.tryCatch(async (req: Request): Promise<object> => {
      this.setBaseURL(req);
      await this.getRepository().validator(req.body);

      const user: IUser = await this.getRepository().save(req.body);

      // Create search index, so users can be searched by names
      await (<UserRepository>this.getRepository()).getSearchClient().createIndex({ 
        id: user.id, firstName: user.firstName, lastName: user.lastName 
      });
 
      this.sendEmailNotification(user, this.VERIFICATION);

      return this.getResponseData(
        user, 
        this.getMessage(`email.${this.VERIFICATION}.message`), 
        this.CREATED
      );
    });
  }

  /**
   * @description Updates password
   *
   * @returns {RequestHandler}
   * @memberof UserController
   */
  public updatePassword (): RequestHandler {
    return this.tryCatch(async (req: Request) => {
      const { password } = req.body;
      const { id, resetStamp } = await this.validateToken(req.params.token, this.PASSWORD);

      await this.getRepository().validator({ password }, { 
        skip: ['firstName', 'lastName', 'email'], // Skip these fields during validation
      });

      const updatedUser = await this.getRepository().update(
        { id }, 
        { password },
        this.getMessage(`error.${this.PASSWORD}.invalid`),
        /*
         * Callback to check if: 
         * - link has already been used
         * - user entered a new password tht is different from the old password
         */ 
        async (user: IUser) => {
          user.resetStamp = Number(user.resetStamp);
          let message!: string;
        
          if (user.resetStamp) {
            message = this.getMessage(`error.${this.PASSWORD}.used`);
          } else if (user.resetStamp !== resetStamp) {
            message = this.getMessage(`error.${this.PASSWORD}.invalid`);
          } else if (this.confirmPassword(password, user.password as string, 
              this.getMessage(`error.required`, this.PASSWORD))) {
            message = this.getMessage(`error.${this.PASSWORD}.same`);
          }

          if (message) {
            throw this.rejectionError(message, this.UNAUTHORIZED);
          }
        }
      );

      return this.getResponseData(
        updatedUser,
        this.getMessage('entity.updated', this.capitalizeFirst(this.PASSWORD))
      );
    });
  }

  /**
   * @description Validates a JSON webtoken
   *
   * @private
   * @param {string} token the token to validate
   * @param {string} message the error message
   * @param {string} tokenType the token type
   * @returns {Decoded} the decoded token
   * @memberof AuthController
   */
  protected async validateToken (token: string, tokenType: string): Promise<Decoded> {
    const decoded = this.decodeJWT(token, {}, tokenType);
    if (Date.now() > (decoded.exp * 1000)) {
      throw this.rejectionError(
        this.getMessage(`error.${tokenType}.expired`, this.capitalizeFirst(tokenType)),
        this.UNAUTHORIZED
      );
    }

    return decoded;
  }
}
