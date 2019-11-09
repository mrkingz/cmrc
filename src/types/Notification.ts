
export interface INotificationOptions {
  subject?: string;
  body?: object;
  resetStamp?: number;
  id?: string
}

export interface IEmailLangs {
  intro: string;
  outro: string;
  text: string;
  subject?: string;
  instructions: string;
}
