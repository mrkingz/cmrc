import {TemplateOptions} from "../../../types/TemplateOptions";

export default class Template {

  private name!: string;
  private text!: string;
  private subject!: string;

  public constructor(templateOptions?: TemplateOptions) {
    if (templateOptions) {
      const { name, text, subject } = templateOptions;

      this.setName(name);
      this.setText(text);
      this.setSubject(subject);
    }
  }

  public setName (name: string): void {
    this.name = name;
  }

  public getName (): string {
    return this.name;
  }

  public setText (text: string): void {
    this.text = text
  }

  public getText (): string {
    return this.text;
  }

  public setSubject (subject: string): void {
    this.subject = subject;
  }

  public getSubject (): string {
    return this.subject;
  }
}