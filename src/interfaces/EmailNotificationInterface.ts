export interface EmailPayloadInferface {
  to: Array<string>;
  from: string;
  subject?: string
  text?: string;
  html?: string;
  isMultiple?: boolean
};

export interface MailOptionsInterface {
  subject?: string;
  body?: object;
}

export interface EmailTemplateInterface {
  name: string;
  text: string;
  url: string; 
}

export interface EmailLangsInterface {
  intro: string;
  outro: string;
  text: string;
  subject?: string;
  instructions: string;
}
