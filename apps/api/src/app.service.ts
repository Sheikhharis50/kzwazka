import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { getEmailConfig, emailTemplates } from './app.utils';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.initializeTransporter();
  }

  getHello(): string {
    return 'Hello World!';
  }

  /**
   * Initialize email transporter
   */
  private async initializeTransporter() {
    try {
      const emailConfig = getEmailConfig(this.configService);
      
      this.transporter = nodemailer.createTransport({
        host: emailConfig.host,
        port: emailConfig.port,
        secure: emailConfig.secure,
        auth: {
          user: emailConfig.auth.user,
          pass: emailConfig.auth.pass,
        },
      });

      // Verify connection configuration
      await this.transporter.verify();
      this.logger.log('Email transporter initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize email transporter:', error);
      throw new Error('Email configuration is invalid. Please check your environment variables.');
    }
  }

  /**
   * Send email using nodemailer
   */
  private async sendEmail(to: string, subject: string, html: string, text: string): Promise<void> {
    try {
      if (!this.transporter) {
        await this.initializeTransporter();
      }

      const emailConfig = getEmailConfig(this.configService);
      
      const mailOptions = {
        from: emailConfig.from,
        to,
        subject,
        html,
        text,
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully to ${to}. Message ID: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error);
      throw new Error('Failed to send email. Please try again later.');
    }
  }

  /**
   * Send OTP email to user
   */
  async sendOtpEmail(email: string, otp: string, userName: string): Promise<void> {
    const template = emailTemplates.otp(userName, otp);
    await this.sendEmail(email, template.subject, template.html, template.text);
  }

  /**
   * Send welcome email after successful verification
   */
  async sendWelcomeEmail(email: string, userName: string): Promise<void> {
    const template = emailTemplates.welcome(userName);
    await this.sendEmail(email, template.subject, template.html, template.text);
  }

  /**
   * Send password reset email with reset token
   */
  async sendPasswordResetEmail(email: string, userName: string, resetToken: string, resetUrl: string): Promise<void> {
    const template = emailTemplates.passwordReset(userName, resetUrl);
    await this.sendEmail(email, template.subject, template.html, template.text);
  }

  /**
   * Send password reset confirmation email
   */
  async sendPasswordResetConfirmationEmail(email: string, userName: string): Promise<void> {
    const template = emailTemplates.passwordResetConfirmation(userName);
    await this.sendEmail(email, template.subject, template.html, template.text);
  }

}
