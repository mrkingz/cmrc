import Template from "./templates/Template";

export default abstract class AbstractNotification<T, E> {

  private template!: Template;

  protected constructor (template: Template) {
    if (template)
      this.setTemplate(template);
  }

  /**
   * Gets the message body
   *
   * @returns {T} the message body
   * @memberOf AbstractNotification<T, E>
   */
  protected abstract getMessageBody (): T;

  /**
   * Gets the template
   *
   * @returns {Template} the template
   * @memberOf AbstractNotification<T, E>
   */
  public getTemplate (): Template {
    return this.template;
  }

  /**
   * Sets the template
   *
   * @param {Template} template the template
   * @memberOf AbstractNotification<T, E>
   */
  public setTemplate (template: Template) {
    this.template = template;
  }

  /**
   * @description Get the notification service instance
   *
   * @returns {Promise<E>}
   * @memberOf AbstractNotification<T, E>
   */
  public abstract send(to: string | Array<string>): Promise<E>
}

