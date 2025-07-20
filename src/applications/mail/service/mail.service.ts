import { Injectable } from '@nestjs/common';
import { SendMailPayload } from '../types/mail.types';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';
import { EmailConfig } from 'src/config/interface';
import { ConfigEnum } from 'src/config/config';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class MailService {
  private readonly transporter: Transporter;

  constructor(
    private readonly config: ConfigService,
    private readonly logger: PinoLogger,
  ) {
    // this.transporter = this.initMailService();
  }

  async sendMail(payload: SendMailPayload) {
    try {
      this.logger.info(`Sending email to ${payload.to}`);
      await this.transporter.sendMail({
        from: {
          name: 'Template',
          address: this.config.get<EmailConfig>(ConfigEnum.EMAIL_CONFIG).user,
        },
        to: [payload.to],
        subject: payload.subject,
        text: payload.content,
        html: payload.html,
      });
      this.logger.info(`Email sent to ${payload.to}`);
    } catch (error) {
      this.logger.error(`Error sending email to ${payload.to}`);
      return error;
    }
  }

  private initMailService() {
    const emailConfig = this.config.get<EmailConfig>(ConfigEnum.EMAIL_CONFIG);

    return nodemailer.createTransport({
      service: emailConfig.service,
      host: emailConfig.host,
      port: parseInt(emailConfig.port),
      secure: emailConfig.isSecure,
      auth: {
        user: emailConfig.user,
        pass: emailConfig.password,
      },
    });
  }
}
