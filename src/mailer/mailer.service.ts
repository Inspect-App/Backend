import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('email.host'),
      port: this.configService.get<number>('email.port'),
      ignoreTLS: this.configService.get<boolean>('email.ignoreTLS'),
      secure: this.configService.get<boolean>('email.secure'),
      auth: {
        user: this.configService.get<string>('email.username'),
        pass: this.configService.get<string>('email.password'),
      },
    });
  }

  async sendVerificationEmail(email: string, verificationCode: string) {
    const mailOptions = {
      from: this.configService.get<string>('email.senderEmail'),
      to: email,
      subject: 'Email Verification',
      text: `Your verification code is ${verificationCode}`,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
