export interface IMailLocals {
  template: string;
  dataInMessage: {
    [key: string]: any;
  };
  recipiens: string | string[];
}
