import sendGrid from '@sendgrid/mail';
import MailGenerator, { ContentBody } from 'mailgen';
import configs from '../../configs'
import AbstractNotification from "./AbstractNotification";
import Template from "./templates/Template";
import EmailTemplate from "./templates/EmailTemplate";
import { ClientResponse } from '@sendgrid/client/src/response';

sendGrid.setApiKey(configs.app.sendGridKey as string);

export default class EmailChannel extends AbstractNotification<ContentBody, [ClientResponse, {}]> {

  /**
   * Creates an instance of EmailChannel.
   *
   * @memberof EmailChannel
   */
  public constructor (template?: Template) {
    super(template as Template);
  }

  /**
   * Overrides AbstractNotification<T, E> method send
   */
  public send(to: string | Array<string>): Promise<[ClientResponse, {}]> {
    return sendGrid.send({
      to: Array.isArray(to) ? to as Array<string> : [to as string],
      subject: this.getTemplate().getSubject(),
      isMultiple: true,
      from: configs.app.fromEmail as string,
      html: this.getGenerator().generate({
        body: this.getMessageBody()
      })
    });
  }

  /**
   * Overrides AbstractNotification<T, E> method getMessageBody
   */
  protected getMessageBody(): ContentBody {
    const template: EmailTemplate = this.getTemplate() as EmailTemplate;

    return {
      name: template.getName(),
      intro: template.getIntro(),
      action: {
        instructions: template.getInstructions(),
        button: {
          color: '#22BC66',
          text: template.getText(),
          link: template.getLink()
        }
      },
      outro: template.getOutro()
    }
  }

  /**
   * Creates an instance of mailgen
   *
   * @private
   * @returns {MailGenerator}
   * @memberof EmailChannel
   */
  private getGenerator (): MailGenerator {
    const { app: { domain, logoUrl }} = configs;
    return new MailGenerator({
      theme: 'default',
      product: {
          name: 'CMRC',
          link: domain,
          logo: logoUrl
      }
    })
  }
}