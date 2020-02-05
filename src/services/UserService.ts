import bcrypt from 'bcryptjs';
import { RequestHandler } from 'express';
import { FindOneOptions } from 'typeorm';
import jwt, { SignOptions, VerifyOptions } from 'jsonwebtoken';

import configs from '../configs';
import constants from '../constants';
import AbstractService from './AbstractService';
import { IFindConditions } from '../types/Repository';
import { SearchPayload } from '../types/SearchOptions';
import FileStorage from '../vendors/upload/FileStorage';
import FileUploader from '../vendors/upload/FileUploader';
import IFileUploadable from '../interfaces/IFileUploadable';
import UserRepository from '../repositories/UserRepository';
import { EmailTemplateOptions } from '../types/TemplateOptions';
import Notification from '../vendors/notifications/Notification';
import { EmailChannel } from '../vendors/notifications/channels';
import AbstractRepository from '../repositories/AbstractRepository';
import { Pagination, PaginationParams } from '../types/Pangination';
import { IEmailLangs, INotificationOptions } from '../types/Notification';
import { AuthResponse, Credentials, Decoded, IUser } from '../types/User';
import EmailTemplate from '../vendors/notifications/templates/EmailTemplate';

const { httpStatus } = constants;

export default class UserService extends AbstractService<IUser> implements IFileUploadable {
  private token?: string;
  protected readonly VERIFICATION: string = 'verification';
  protected readonly PASSWORD: string = 'password';
  protected readonly AUTHENTICATION: string = 'authentication';
  protected readonly notifier!: EmailChannel;

  /**
   * Create an instance of UserService
   */
  public constructor() {
    super();
  }

  /**
   * Verifies and activates a newly registered account
   *
   * @param {string} token the token from the url
   * @return {Promise<IUser>} a promise that resolves with verified account details
   * @memberOf UserService
   */
  public async accountVerification(token: string): Promise<IUser> {
    const { id } = await this.validateTokenFromURL(token, this.VERIFICATION);
    const foundUser: IUser = await this.findOneOrFail({ id } as FindOneOptions<IUser>);

    return super.update(foundUser, { isVerified: true }, (user: IUser) => {
      // Callback function to check if email has been verified previously
      if (user.isVerified) {
        throw this.error(this.getMessage('error.verified'), httpStatus.UNAUTHORIZED);
      }
    });
  }

  /**
   * Authenticate user with credentials (username and password)
   *
   * @param {Credentials} credentials object containing the username and password
   * @returns {Promise<AuthResponse>} a promise that resolves with a message that indicate authentication was successful
   * @memberOf UserService
   */
  public async authentication(credentials: Credentials): Promise<AuthResponse> {
    const { email, password } = credentials;
    const langKey = this.AUTHENTICATION;
    let message: string = this.getMessage(`error.${langKey}.invalid`);

    const foundUser: IUser = await this.findOneOrFail({
      where: { email },
      select: ['id', 'password', 'isVerified'],
    } as FindOneOptions<IUser>);

    if (foundUser.isVerified) {
      // check if user account has been verified
      if (this.confirmPassword(password, foundUser.password as string, message)) {
        return {
          token: this.generateJWT({ id: foundUser.id }),
          message: this.getMessage(`${langKey}.success`),
        };
      }
      message = this.getMessage(`${langKey}.invalid`);
    } else {
      message = this.getMessage(`${langKey}.unverified`);
    }

    return { token: null, message };
  }

  /**
   * Authenticates a user.
   *
   * @param {string} token the authentication token generated after sign in
   * @returns {Promise<IUser>} a promise that resolves with the authenticated user details
   * @memberOf UserService
   */
  public async checkAuthentication(token: string): Promise<IUser> {
    const { id } = this.decodeJWT(token, {}, this.AUTHENTICATION);
    const foundUser: IUser = await this.findOneOrFail({ where: { id } });

    return foundUser;
  }

  /**
   * Confirms user's password during authentication
   *
   * @private
   * @param {string} password new password
   * @param {string} oldPassword old/current password
   * @returns {boolean}
   * @memberof UserService
   */
  private confirmPassword(password: string, oldPassword: string, message: string): boolean {
    try {
      return bcrypt.compareSync(password, oldPassword);
    } catch (error) {
      throw this.error(message, httpStatus.UNAUTHORIZED);
    }
  }

  /**
   * Create a new instance of User in database
   *
   * @param {IUser} fields
   * @returns {Promise<IUser>} a promise that resolves with  the user details
   * @memberof UserService
   */
  public async create(fields: IUser): Promise<IUser> {
    const { email } = fields;

    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      password,
      resetStamp,
      ...user
    }: IUser = await super.create(fields, () =>
      this.checkDuplicate({ where: { email } }, this.getMessage(`error.email.conflict`)),
    );

    this.sendEmail(user, this.VERIFICATION);

    await (this.getRepository() as UserRepository).getSearchClient().createIndex({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    return user;
  }

  /**
   * Decodes a JSON webtoken
   *
   * @private
   * @param {string} token
   * @param {VerifyOptions} configOptions configuration options
   * @param {string} tokenType the type of token; i.e., could be email verification/password reset/authentication
   * @returns {Decoded} the decoded token
   * @memberof UserService
   */
  private decodeJWT(token: string, configOptions: VerifyOptions, tokenType: string): Decoded {
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

      throw this.error(message, httpStatus.UNAUTHORIZED);
    }
  }

  /**
   * Gets all users
   *
   * @param options the find options
   * @returns {Promise<Pagination<IUser>>} a promise that resolves with the list of users
   * @memberOf UserService
   */
  public async find(options: IFindConditions): Promise<Pagination<IUser>> {
    const { page, limit, sort, status } = options;
    const conditions = status && typeof Boolean(status) === 'boolean' ? { isVerified: status } : {};

    return await this.getRepository().find({
      where: conditions,
      page,
      limit,
      sort,
    });
  }

  /**
   * Gets an instance of FileStorage
   *
   * @returns {FileStorage} an instance of file storage
   * @memberof UserService
   */
  public getFileStorageInstance(): FileStorage {
    return new FileStorage(`${configs.app.name}/photos`);
  }

  /**
   * Creates an instance of FileUploader
   *
   * @returns {FileUploader} an instance of FileUploader
   * @memberof UserService
   */
  public getFileUploaderInstance(): FileUploader {
    return new FileUploader(this);
  }

  /**
   * Generates a JSON Webtoken
   *
   * @private
   * @param {object} payload the token payload
   * @param {object } configOptions the optional configs
   * @returns {string}
   * @memberof UserService
   */
  private generateJWT(payload: string | object, configOptions?: SignOptions): string {
    const { secret, issuer } = configs.app.jwt;
    return jwt.sign(payload, secret as string, { issuer, ...configOptions });
  }

  /**
   * Generates links for email notification
   *
   * @private
   * @param {{[key: string]: string}} payload
   * @param {string} emailType
   * @returns {string} the generated link
   * @memberof UserService
   */
  private generateLink(payload: string | object, emailType: string): string {
    const expiresIn = emailType === this.PASSWORD ? { expiresIn: '1d' } : {};
    this.token = this.generateJWT(payload, {
      subject: emailType,
      ...expiresIn,
    });

    return `${this.getBaseUrl()}/auth/${emailType}/${this.token}`;
  }

  private getEmailTemplateOptions(
    user: IUser,
    emailType: string,
    options: INotificationOptions = {},
  ): EmailTemplateOptions {
    const { intro, subject, outro, instructions, text } = this.getLang(`email.${emailType}`) as IEmailLangs;
    const { id, firstName: name } = user;

    return {
      intro,
      outro,
      text,
      instructions,
      subject,
      name,
      link: this.generateLink({ id, ...options }, emailType),
    } as EmailTemplateOptions;
  }

  /**
   * Creates and return an instance of AbstractRepository<IUser>
   *
   * @protected
   * @returns {AbstractRepository<IUser>}
   * @memberof UserService
   */
  public getRepository(): AbstractRepository<IUser> {
    return new UserRepository();
  }

  /**
   * Gets a specific user
   * @param {string} userId user id from params
   * @param {IUser} authUser the authenticated user
   * @returns {IUser} the user details
   * @memberof UserService
   */
  public async getProfile(userId: string, authUser: IUser): Promise<IUser> {
    let user: IUser;
    /*
     * If user is the authenticated user
     * then, id from params must match the id of the authenticated user
     */
    if (authUser.id === userId) user = authUser;
    /*
     * If id from params does not match,
     * Check if user is admin, as only admin can view other user's profile
     * Otherwise, throw an unauthorized message
     */ else if (authUser.isAdmin) user = await this.findOneOrFail({ where: { id: userId } });
    else throw this.error(this.getMessage('error.unauthorized'), httpStatus.UNAUTHORIZED);

    return user;
  }

  /**
   * Removes a profile photo
   *
   * @param {IUser} user the authenticated user
   * @returns {Promise<IUser>} a promise that resolves with the updated user
   * @memberOf UserService
   */
  public async removePhoto(user: IUser): Promise<IUser> {
    const updatedUser = await this.update(user, { photo: null });
    await this.getFileUploaderInstance().deleteFile(user.email as string);

    return updatedUser;
  }

  /**
   * Searches users
   *
   * @param {SearchPayload} searchPayload payload of the fields to search and the query term
   * @param {PaginationParams} paginationParams the pagination parameters if any
   * @returns {Promise<Pagination<IUser>>}  a promise that resolves with the paginated response
   * @memberOf UserService
   */
  public async search(searchPayload: SearchPayload, paginationParams: PaginationParams): Promise<Pagination<IUser>> {
    return await (this.getRepository() as UserRepository)
      .getSearchClient()
      .searchIndex(searchPayload, paginationParams);
  }

  private async sendEmail(user: IUser, emailType: string, options: INotificationOptions = {}) {
    const template: EmailTemplate = new EmailTemplate(this.getEmailTemplateOptions(user, emailType, options));

    return Notification.getChannel(template).send(user.email as string);
  }

  /**
   * Sends a password reset email notification
   *
   * @param {string} email the receiver's email address
   * @returns {Promise<void>} void
   * @memberOf UserService
   */
  public async sendPasswordResetLink(email: string): Promise<void> {
    const foundUser: IUser = await this.findOneOrFail({ email } as FindOneOptions<IUser>);

    const resetStamp: number = Date.now();
    const updatedUser = await this.update(foundUser, { resetStamp });

    return this.sendEmail(updatedUser, this.PASSWORD, { resetStamp });
  }

  /**
   * Uploads a file
   *
   * @param user the authenticated user
   * @param fileType the file type
   * @returns RequestHandler
   * @memberOf UserService
   */
  public uploadFile(user: IUser, fileType: string): RequestHandler {
    return this.getFileUploaderInstance()
      .uploadFile(user.email as string, fileType)
      .single('file');
  }

  /**
   * Updates user's password
   *
   * @param {string} token the token from the password reset link
   * @param {string} password the new password
   * @returns {Promise<IUser>} a promise that resolves with the updated user
   * @memberOf UserService
   */
  public async updatePassword(token: string, newPassword: string): Promise<IUser> {
    const { id, resetStamp } = await this.validateTokenFromURL(token, this.PASSWORD);
    const foundUser: IUser = await this.findOneOrFail({
      where: { id },
      select: ['id', 'password', 'resetStamp'],
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...updatedUser } = await this.update(
      foundUser,
      { password: newPassword },
      /*
       * Callback to check if:
       * - link has already been used
       * - user entered a new password tht is different from the old password
       */
      async (user: IUser) => {
        user.resetStamp = Number(user.resetStamp);
        let message!: string;

        if (user.resetStamp === 0) message = this.getMessage(`error.${this.PASSWORD}.used`);
        else if (user.resetStamp !== resetStamp) message = this.getMessage(`error.${this.PASSWORD}.invalid`);
        else if (
          this.confirmPassword(newPassword, user.password as string, this.getMessage(`error.required`, this.PASSWORD))
        ) {
          message = this.getMessage(`error.${this.PASSWORD}.same`);
        }

        if (message) throw this.error(message, httpStatus.UNAUTHORIZED);
      },
    );

    return updatedUser;
  }

  /**
   * Validates a JSON webtoken
   *
   * @private
   * @param {string} token the token to validate
   * @param {string} message the error message
   * @param {string} tokenType the token type
   * @returns {Decoded} the decoded token
   * @memberOf UserService
   */
  private async validateTokenFromURL(token: string, tokenType: string): Promise<Decoded> {
    const decoded = this.decodeJWT(token, {}, tokenType);
    if (Date.now() > decoded.exp * 1000) {
      throw this.error(
        this.getMessage(`error.${tokenType}.expired`, this.upperFirst(tokenType)),
        httpStatus.UNAUTHORIZED,
      );
    }

    return decoded;
  }
}
