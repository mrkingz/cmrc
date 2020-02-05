import EmailChannel from "./channels/EmailChannel";
import SMSChannel from "./channels/SMSChannel";
import Template from "./templates/Template";
import EmailTemplate from "./templates/EmailTemplate";

export default class Notification {

  public static getChannel(template: Template): EmailChannel | SMSChannel {
    return (template instanceof EmailTemplate)
      ? new EmailChannel(template as EmailTemplate)
      : new SMSChannel();
  }
}