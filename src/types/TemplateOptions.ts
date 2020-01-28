export interface TemplateOptions {
  name: string;
  text: string;
  subject: string;
}

export interface EmailTemplateOptions extends TemplateOptions {
  link: string;
  intro: string;
  outro: string;
  instructions: string;
}