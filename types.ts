export enum AppStep {
  REQUEST_ORIGINAL = 'REQUEST_ORIGINAL',
  REQUEST_SRT = 'REQUEST_SRT',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export enum Sender {
  BOT = 'BOT',
  USER = 'USER'
}

export interface Message {
  id: string;
  sender: Sender;
  content: string;
  timestamp: Date;
  isMarkdown?: boolean;
}
