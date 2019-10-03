import bcrypt from 'bcrypt';
import { Request } from 'express';
import sendGrid from '@sendgrid/mail';
import { FindOneOptions } from 'typeorm';
import jwt, { VerifyOptions, SignOptions } from 'jsonwebtoken';

import configs from '../configs'
import { IUser } from '../interfaces/IEntity';
import AbstractController from './AbstractController';
import UserRepository from '../services/repositories/UserRepository';
import IHTTPResponseOptions from '../interfaces/IHTTPResponseOptions';
import { IEmailLangs, IMailOptions } from '../interfaces/INotification';
import NotificationService from '../services/notifications/NotificationService';
import AbstractRepository from '../services/repositories/AbstractRepository';
import { NextFunction } from 'connect';
import isEmpty from 'lodash.isempty';
import { userInfo } from 'os';

sendGrid.setApiKey(configs.app.sendGridKey as string)

type Decoded = {
  id: string,
  isAdmin: boolean,
  exp: number,
}
class UserController extends AbstractController<IUser> {

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
   * @description Identifies a verification notification languages, token type
   *
   * @type {string}
   * @memberof UserController
   */
  private readonly VERIFICATION: string = 'verification';

  /**
   * @description Identifies a password reset link notification languages, token type
   *
   * @private
   * @type {string}
   * @memberof UserController
   */
  private readonly PASSWORD: string = 'password';

  /**
   * @description Identifies authentication languages
   *
   * @private
   * @type {string}
   * @memberof UserController
   */
  private readonly AUTHENTICATION: string = 'authentication';

  /**
   * @description Instane of NotificationService to send notification
   *
   * @private
   * @type {NotificationService}
   * @memberof UserController
   */
  private readonly notifier!: NotificationService;

  /**
   * @description Instance of RepositoryService to interface with the database
   *
   * @private
   * @type {UserRepository}
   * @memberof UserController
   */
  private readonly repository: AbstractRepository<IUser>;

  /**
   * @description Creates a singleton instance of UserController.
   * 
   * @param {NotificationService} notifier the notification service instance
   * @param {UserRepository} repository the repository service instane
   * @memberof UserController
   */
  constructor(notifier: NotificationService, repository: UserRepository) {
    super();
    this.notifier = notifier;
    this.repository = repository;

    // We force the constructor to always return a singleton
    UserController.singleton = !!UserController.singleton
      ? UserController.singleton
      : this;
    
    return UserController.singleton;   
  }

  /**
   * @description Authenticate user with email and password
   *
   * @returns {Function}
   * @memberof UserController
   */
  public authenticateUser () {
    return this.tryCatch(async (req: Request, res: Response, next: NextFunction) => {
      const { id } = this.decodeJWT(this.extractToken(req), {}, this.AUTHENTICATION);
      const user: IUser = await this.getRespository().findOneOrFail({ id } as {});    

      req.body.user = this.removePasswordFromUserData(user);
      return next;
    })
  }

  /**
   * @description Extracts the authentication token associated with the request
   *
   * @private
   * @param {Request} req the HTTP request object
   * @returns {string} the extected token
   * @memberof UserController
   */
  private extractToken (req: Request): string {
    let token = req.headers['x-access-token']
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
   * @description Sign in a registered user
   *
   * @returns {Function}
   * @memberof UserController
   */
  public signIn () {
    return this.tryCatch(async (req: Request) => {
      const { email, password } = req.body;
      const langKey = this.AUTHENTICATION;
      let message: string = this.getMessage(`${langKey}.${(email ? 'invalid' : 'required')}`);

      const user: IUser = await this.getRespository().findOneOrFail(
        { email } as FindOneOptions<IUser>, message
      );

      if (user.isVerified) {
        message = this.getMessage(`${langKey}.required`);
        if (this.confirmPassword(password, user.password as string, message)) { 
          const token: string = this.generateJWT({ id: user.id })
          return this.getResponseData( 
            { ...this.removePasswordFromUserData(user), token }, 
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
   * @returns {Function}
   * @memberof UserController
   */
  public signUp () {
    return this.tryCatch(async (req: Request): Promise<object> => {
      this.setBaseURL(req);
      await this.getRespository().validator(req.body);

      const user: IUser = await this.getRespository().save({
        ...req.body, password: this.hashPassword(req.body.password) 
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
   * @description Verifies registration
   *
   * @returns {Function}
   * @memberof UserController
   */
  public accountVerification () {
    return this.tryCatch(async (req: Request): Promise<object> => {
      
      const decoded = this.validateToken(req.params.token, this.VERIFICATION);

      const updatedUser = await this.getRespository().update(
        { id: decoded.id }, 
        { isVerified: true }, 
        this.getMessage(`error.${this.VERIFICATION}.invalid`),
        /*
         * Callback function to check if email has been verified previously
         */
        (user: IUser) => {
          if (user.isVerified) {
            throw this.rejectionError(
              this.getMessage('error.verified', this.capitalizeFirst(this.VERIFICATION)), this.UNAUTHORIZED
            );
          }
        }
      );

      return this.getResponseData(
        this.removePasswordFromUserData(updatedUser), 
        this.getMessage('email.verified')
      );
    });
  }

  /**
   * @description Check if email has been used
   *
   * @returns {Function}
   * @memberof UserController
   */
  public checkIfUniqueEmail () {
    return this.tryCatch(async (req: Request, res: Response, next: NextFunction): Promise<object> => {
      const { email } = req.body;
      const data = await this.getRespository().findOne({ email } as FindOneOptions<IUser>);
      if (isEmpty(data)) {
        return next;
      }  

      throw this.rejectionError(this.getMessage('error.conflict'), this.CONFLICT)
    })
  }
  
  /**
   * @description Generates a JSON Webtoken
   *
   * @private
   * @param {object} payload the token payload
   * @param {object } configOptions the optional configs
   * @returns {string}
   * @memberof UserController
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
   * @memberof UserController
   */
  private getNotifier (): NotificationService {
    return this.notifier;
  }

  /**
   * @description Generates mail options for verification email
   *
   * @protected
   * @param {IUser} user
   * @param {string} emailType the type of email
   * @returns {IMailOptions} the email template
   * @memberof UserController
   */
  private getMailBody(user: IUser, emailType: string): IMailOptions {

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
            link: this.generateLink(user, emailType)
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
  private generateLink (user: IUser, emailType: string): string {
    const expiresIn = emailType === this.PASSWORD ? { expiresIn: '1d' } : {};
    const token = this.generateJWT({ id: user.id as string }, { 
      subject: emailType,
      ...expiresIn
    });
    return `${this.getBaseURL()}/auth/${emailType}/${token}`;
  }

  /**
   * @override method getRespositoryService in RespositoryService
   */
  protected getRespository(): AbstractRepository<IUser> {
    return this.repository;
  }

  /**
   * @description A convinient function to protect user password
   *
   * @private
   * @param {IUser} user
   * @returns {IHTTPResponseOptions<IUser>}
   * @memberof UserController
   */
  private removePasswordFromUserData (user: IUser): IHTTPResponseOptions<IUser> {
    const { password, ...otherDetails } = user
    return otherDetails as object;
  }

  /**
   * @description Decodes a JSON webtoken
   *
   * @private
   * @param {string} token
   * @param {object} configOptions
   * @param {string} tokenType
   * @returns {Decoded}
   * @memberof UserController
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
   * @description Sends email notification 
   * 
   * @param {IUser} user the receiver
   * @param {String} emailType the type of email notification
   */
  public sendEmailNotification(user: IUser, emailType: string): void {
    this.getNotifier().sendEmail(user.email as string, this.getMailBody(user, emailType));
  }

  /**
   * @description Sends a password reset email 
   *
   * @returns {Function} 
   * @memberof UserController
   */
  public sendPasswordResetLink () {
    return this.tryCatch(async (req: Request): Promise<object> => {
      const { email } = req.body;
      this.setBaseURL(req);

      await this.getRespository().validator(
        this.getRespository().create({ email }) as IUser,
        { skip: ['firstName', 'lastName', 'password'] } // skip these fields
      );

      const user: IUser = await this.getRespository().findOneOrFail(
        { email: req.body.email } as object, 
        this.getMessage('error.notFound', this.getRespository().getEntityName())
      );

      await this.getRespository().update({ id: user.id }, { passwordReset: true });
  
      this.sendEmailNotification(user, this.PASSWORD);
      
      return this.getResponseData(
        this.removePasswordFromUserData(user), this.getMessage(`email.${this.PASSWORD}.message`)
      );
    });
  }

  /**
   * @description Updates password
   *
   * @returns {Function}
   * @memberof UserController
   */
  public updatePassword () {
    return this.tryCatch(async (req: Request) => {
      const { password } = req.body;
      const { id } = await this.validateToken(req.params.token, this.PASSWORD);

      await this.getRespository().validator({ password }, { 
        skip: ['firstName', 'lastName', 'email'], // Skip these fields during validation
      });

      const updatedUser = await this.getRespository().update(
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
  public updateProfile () {
    return this.tryCatch(async (req: Request) => {
      const { user, ...details } = req.body;
      let updates: { [key: string]: string} = {};
      Object.keys(details).forEach(key => { updates[key] = details[key]; });
     
      updates = await this.getRespository().validator(updates, {
        // skip other fillable fields that are not being updated
        skip: this.getRespository().getFillables().filter(field => !Object.keys(updates).includes(field))
      }) as {};

      const updated = await this.getRespository().update({ id: user.id }, {
        ...updates, email: user.email, password: user.password
      });

      return this.getResponseData(
        this.removePasswordFromUserData(updated), 
        this.getMessage('entity.updated', 'Profile')
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
   * @memberof UserController
   */
  private validateToken (token: string, tokenType: string): Decoded {
    const decoded = this.decodeJWT(token, {}, tokenType);
    if (Date.now() > (decoded.exp * 1000)) {
      throw this.rejectionError(
        this.getMessage(`error.${tokenType}.expired`, this.capitalizeFirst(tokenType)),
        this.UNAUTHORIZED
      )
    }

    return decoded;
  }

  /**
   * @description Hashes password
   *
   * @private
   * @param {string} password
   * @returns {string}
   * @memberof UserController
   */
  private hashPassword (password: string): string {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
  }

  /**
   * @description Confirms user's password during authentication
   *
   * @private
   * @param {string} password
   * @param {string} oldPassword
   * @returns {boolean}
   * @memberof UserController
   */
  private confirmPassword (password: string, oldPassword: string, message: string): boolean {
    try {
      return bcrypt.compareSync(password, oldPassword);
    } catch (error) {
      throw this.rejectionError(message, this.UNAUTHORIZED);
    }
  }
}

export default new UserController(
  new NotificationService(), 
  new UserRepository()
);
