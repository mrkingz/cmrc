import Template from './Template';
import { EmailTemplateOptions } from '../../../types/TemplateOptions';

export default class EmailTemplate extends Template {
  private link!: string;
  private intro!: string;
  private outro!: string;
  private instructions!: string;

  public constructor(templateOptions?: EmailTemplateOptions) {
    super(templateOptions);

    if (templateOptions) {
      const { link, intro, outro, instructions } = templateOptions;

      this.setLink(link);
      this.setIntro(intro);
      this.setOutro(outro);
      this.setInstructions(instructions);
    }
  }

  public setLink(link: string): void {
    this.link = link;
  }
  public getLink(): string {
    return this.link;
  }
  public setIntro(intro: string): void {
    this.intro = intro;
  }
  public getIntro(): string {
    return this.intro;
  }
  public setOutro(outro: string): void {
    this.outro = outro;
  }
  public getOutro(): string {
    return this.outro;
  }
  public setInstructions(instructions: string): void {
    this.instructions = instructions;
  }
  public getInstructions(): string {
    return this.instructions;
  }
}
