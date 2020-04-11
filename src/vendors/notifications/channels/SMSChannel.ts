/* eslint-disable @typescript-eslint/no-unused-vars */
import Template from '../templates/Template';
import AbstractNotification from '../AbstractNotification';

export default class SMSChannel extends AbstractNotification<string, any> {
  /**
   * Creates a singleton singleton of SMSChannel.
   *
   * @memberof EmailChannel
   */
  public constructor(template?: Template) {
    super(template as Template);
  }

  getMessageBody(): string {
    // Todo: add implementation
    return '';
  }

  async send(to: string | Array<string>): Promise<any> {
    // Todo: add implementation
    return;
  }
}
