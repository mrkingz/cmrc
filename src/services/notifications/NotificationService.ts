import sendGrid from '@sendgrid/mail';
import MailGenerator, { ContentBody } from 'mailgen';
import configs from '../../configs'
import { 
  IMailOptions,
} from '../../interfaces/INotification';

sendGrid.setApiKey(configs.app.sendGridKey as string);

export default class NotificationService {

  /**
   * @description Sends an email notification
   *
   * @param {string} to the receiver's email
   * @param {IMailOptions} options
   * @memberof NotificationService
   */
  public sendEmail(to: string | Array<string>, options: IMailOptions) {
    sendGrid.send({
      to: to.constructor === Array ? to as Array<string> : [to as string], 
      subject: options.subject, 
      isMultiple: true,
      from: configs.app.fromEmail as string, 
      html: this.getGenerator().generate({
        body: options.body as ContentBody
      })
    });
  }

  /**
   * @description Creates an instance of mailgen
   *
   * @private
   * @returns {MailGenerator}
   * @memberof NotificationService
   */
  private getGenerator (): MailGenerator {
    return new MailGenerator({
      theme: 'default',
      product: {
          name: 'CMRC',
          link: configs.app.domain
      }
    })
  }
}