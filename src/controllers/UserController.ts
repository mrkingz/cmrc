import jwt from 'jsonwebtoken';
import sendGrid from '@sendgrid/mail';
import { FindOneOptions } from 'typeorm';
import { Request, Response } from 'express';

import configs from '../configs'
import AbstractController from './AbstractController';
import UserInterface from '../interfaces/UserInterface';
import NotificationService from '../services/notifications/NotificationService';
import { EmailLangsInterface } from '../interfaces/EmailNotificationInterface';
import RespositoryService from '../services/repositories/RepositoryService';

sendGrid.setApiKey(configs.app.sendGridKey as string)

type Decoded = {
  id: string,
  isAdmin: boolean,
  exp: number,
}
class UserController extends AbstractController<UserInterface> {
  /**
   * @description 
   *
   * @type {string}
   * @memberof UserController
   */
  public readonly VERIFICATION: string = 'verification';

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
   * @type {RespositoryService<UserInterface>}
   * @memberof UserController
   */
  private repository: RespositoryService<UserInterface>;

  /**
   * @description Creates an instance of UserController.
   * 
   * @param {NotificationService} notifier the notification service instance
   * @param {RespositoryService<UserInterface>} repository the repository service instane
   * @memberof UserController
   */
  constructor(notifier: NotificationService, repository: RespositoryService<UserInterface>) {
    super();
    this.notifier = notifier;
    this.repository = repository;
  }

  /**
   * @override method getRespositoryService in RespositoryService
   */
  protected getRespositoryService(): RespositoryService<UserInterface> {
    return this.repository;
  }

  /**
   * @description Sign up a new user
   * 
   * @returns {Function} an async function which accepts an express middleware function 
   * as a callback to handle the POST request
   */
  public signUp() {
    return this.asyncFunction(async (req: Request, res: Response): Promise<object> => {
      this.setBaseURL(req);

      const user = await this.getRespositoryService().create({
         ...req.body, isVerified: false 
      }) as any;
      this.sendEmailNotification(user, this.VERIFICATION);

      return this.getResponseData(
        user, this.getLang(`email.${this.VERIFICATION}.message`) as string, this.CREATED
      );
    });
  }

  /**
   * @description 
   *
   * @returns
   * @memberof UserController
   */
  public accountVerification () {
    return this.asyncFunction(async (req: Request, res: Response): Promise<any> => {
      const text = this.VERIFICATION;
      const decoded = this.validateToken(
        req.params.token, this.getLang('error.expired', this.capitalizeFirst(text)) as string, text
      );

      const user: UserInterface = await this.getRespositoryService().findOneOrFail(
        { id: decoded.id } as FindOneOptions<UserInterface>,
        this.getLang('error.invalid', this.VERIFICATION) as string
      );

      if (user.isVerified) {
        throw this.rejectionError(
          this.getLang('error.verified', this.capitalizeFirst(text)), this.UNAUTHORIZED
        );
      }

      const updatedUser = await this.getRespositoryService().update(user as {}, { isVerified: true });
      const { password, ...otherDetails } = updatedUser as any;

       return this.getResponseData(otherDetails, this.getLang('email.verified') as string );
    });
  }

  /**
   * @description Sends email notification 
   * 
   * @param {UserInterface} user the receiver
   * @param {String} emailType the type of email notification
   */
  public sendEmailNotification(user: UserInterface, emailType: string): void {

    this.getNotifier().sendEmail(
      user.email as string,  this.getMailBody(user, emailType)
    );
  }
  
  /**
   * @description Generates mail options for verification email
   *
   * @protected
   * @param {UserInterface} user
   * @param {string} emailType the type of email
   * @returns
   * @memberof UserController
   */
  protected getMailBody(user: UserInterface, emailType: string): object {

    const { 
      intro, subject, outro, instructions, text 
    } = this.getLang(`email.${emailType}`) as EmailLangsInterface

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
  private generateJWT (payload: object, configOptions: object): string {
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
   * @param {UserInterface} user the user
   * @param {string} emailType
   * @returns
   * @memberof NotificationService
   */
  private generateLink (user: UserInterface, emailType: string): string {
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
}

export default new UserController(new NotificationService(), new RespositoryService<UserInterface>('User'));
