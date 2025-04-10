export type SendMailPayload = {
  to: string;
  subject: string;
  content: string;
  html?: string;
};
