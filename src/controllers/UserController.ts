import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import sendGrid from '@sendgrid/mail';
import { FindOneOptions } from 'typeorm';
import { Request, Response } from 'express';

import configs from '../configs'
import AbstractController from './AbstractController';
import { IUser } from '../interfaces/IEntity';
import NotificationService from '../services/notifications/NotificationService';
import { IEmailLangs, IMailOptions } from '../interfaces/INotification';
import RespositoryService from '../services/repositories/RepositoryService';
import IHTTPResponseOptions from '../interfaces/IHTTPResponseOptions';

sendGrid.setApiKey(configs.app.sendGridKey as string)

type Decoded = {
  id: string,
  isAdmin: boolean,
  exp: number,
}
class UserController extends AbstractController<IUser> {

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
   * @type {RespositoryService<IUser>}
   * @memberof UserController
   */
  private repository: RespositoryService<IUser>;

  /**
   * @description Creates an instance of UserController.
   * 
   * @param {NotificationService} notifier the notification service instance
   * @param {RespositoryService<IUser>} repository the repository service instane
   * @memberof UserController
   */
  constructor(notifier: NotificationService, repository: RespositoryService<IUser>) {
    super();
    this.notifier = notifier;
    this.repository = repository;
  }

  /**
   * @override method getRespositoryService in RespositoryService
   */
  protected getRespositoryService(): RespositoryService<IUser> {
    return this.repository;
  }

  /**
   * @description Sends a password reset email 
   *
   * @returns {Function} an async function which accepts an express middleware function 
   * as a callback to handle the POST request
   * @memberof UserController
   */
  public sendPasswordResetLink () {
    return this.tryCatch(async (req: Request, res: Response): Promise<object> => {
      this.setBaseURL(req);

      const { email } = req.body;
      await this.getRespositoryService().validator(
        this.getRespositoryService().createProps({ email }) as IUser,
        // We don't to validate these fields, but the email only
        { skip: ['firstName', 'lastName', 'password'] });

      const user: IUser = await this.getRespositoryService().findOneOrFail(
        { email: req.body.email } as object, 
        this.getLang('error.notFound', this.getRespositoryService().getEntityName()) as string);
  
      this.sendEmailNotification(user, this.PASSWORD);
      
      return this.getResponseData(
        this.removePasswordFromUserData(user), 
        this.getLang(`email.${this.PASSWORD}.message`) as string);
    });
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
   * @description Sign up a new user
   * 
   * @returns {Function} an async function which accepts an express middleware function 
   * as a callback to handle the POST request
   */
  public signUp () {
    return this.tryCatch(async (req: Request, res: Response): Promise<object> => {
      this.setBaseURL(req);

      const user: IUser = await this.getRespositoryService().create({
        ...req.body,
        password: this.hashPassword(req.body.password)
      });
      this.sendEmailNotification(user, this.VERIFICATION);

      return this.getResponseData(
        this.removePasswordFromUserData(user), 
        this.getLang(`email.${this.VERIFICATION}.message`) as string, this.CREATED);
    });
  }

  /**
   * @description Sign in a registered user
   *
   * @returns {Function} an async function which accepts an express middleware function 
   * as a callback to handle the POST request
   * @memberof UserController
   */
  public signIn () {
    return this.tryCatch(async (req: Request, res: Response) => {
      const { email, password } = req.body;

      const user: IUser = await this.getRespositoryService().findOneOrFail(
          { email } as FindOneOptions<IUser>,
          this.getLang(`${this.AUTHENTICATION}.${(email ? 'invalid' : 'required')}`) as string
        );
        
        if (this.confirmPassword(password, user.password as string)) {
          const token: string = this.generateJWT({ id: user.id, isAdmin: user.isAdmin })

          return this.getResponseData( 
            { ...this.removePasswordFromUserData(user), token },
            this.getLang(`${this.AUTHENTICATION}.success`) as string);
        }
        return this.rejectionError(`${this.AUTHENTICATION}.inavlid`);
    });
  }

  /**
   * @description 
   *
   * @returns
   * @memberof UserController
   */
  public accountVerification () {
    return this.tryCatch(async (req: Request, res: Response): Promise<any> => {
      const text = this.VERIFICATION;
      const decoded = this.validateToken(
        req.params.token, this.getLang('error.expired', this.capitalizeFirst(text)) as string, text
      );

      const updatedUser = await this.getRespositoryService().update(
        { id: decoded.id }, 
        { isVerified: true }, 
        { 
          message: this.getLang('error.invalid', this.VERIFICATION) as string,
          skip: ['firstName', 'lastName', 'email', 'password', 'isVerified']
        },
        /*
         * A callback function to check if email has been verified previously
         */
        (user: IUser) => {
          if (user.isVerified) {
            throw this.rejectionError(
              this.getLang('error.verified', this.capitalizeFirst(text)), this.UNAUTHORIZED
            );
          }
        }
      );

      return this.getResponseData(
        this.removePasswordFromUserData(updatedUser), 
        this.getLang('email.verified') as string);
    });
  }

  /**
   * @description Sends email notification 
   * 
   * @param {IUser} user the receiver
   * @param {String} emailType the type of email notification
   */
  public sendEmailNotification(user: IUser, emailType: string): void {

    this.getNotifier().sendEmail(
      user.email as string,  this.getMailBody(user, emailType)
    );
  }
  
  /**
   * @description Generates mail options for verification email
   *
   * @protected
   * @param {IUser} user
   * @param {string} emailType the type of email
   * @returns
   * @memberof UserController
   */
  protected getMailBody(user: IUser, emailType: string): IMailOptions {

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
   * @description Generates a JSON Webtoken
   *
   * @private
   * @param {object} payload the token payload
   * @param {object } configOptions the optional configs
   * @returns {string}
   * @memberof UserController
   */
  private generateJWT (payload: object, configOptions?: object): string {
    return jwt.sign(payload, configs.app.jwtSecret as string, configOptions);
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
   * @description Generates links for email notifications 
   *
   * @private
   * @param {IUser} user the user
   * @param {string} emailType
   * @returns
   * @memberof NotificationService
   */
  private generateLink (user: IUser, emailType: string): string {
    const token = this.generateJWT({ id: user.id as string }, { expiresIn: '3d' });
    return `${this.getBaseURL()}/auth/${emailType}/${token}`;
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
  private decodeJWT (token: string, configOptions: object, tokenType: string): Decoded {
    try {
      return jwt.verify(token, configs.app.jwtSecret as string, configOptions) as Decoded
    } catch (error) {
      let message!: string
      switch (tokenType) {
        case this.VERIFICATION: 
          message = this.getLang('error.invalid', this.VERIFICATION) as string;
      }

      throw this.rejectionError(message, this.UNAUTHORIZED);
    }
  }

  /**
   * @description Validates a JSON webtoken
   *
   * @private
   * @param {string} token
   * @param {string} message
   * @param {string} tokenType
   * @returns {Decoded}
   * @memberof UserController
   */
  private validateToken (token: string, message: string, tokenType: string): Decoded {
    const decoded = this.decodeJWT(token, {}, tokenType);
    if (Date.now() > (decoded.exp * 1000)) {
      throw this.rejectionError(message, this.UNAUTHORIZED)
    }
    return decoded;
  }

  private hashPassword (password: string): string {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
  }

  private confirmPassword (password: string, oldPassword: string): boolean {
    try {
      return bcrypt.compareSync(password, oldPassword);
    } catch (error) {
      throw this.rejectionError(this.getLang(`${this.AUTHENTICATION}.required`), this.UNAUTHORIZED);
    }
  }
}

export default new UserController(new NotificationService(), new RespositoryService<IUser>('User'));
