import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { getEmailConfig, emailTemplates } from './app.utils';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    // Initialize email transporter asynchronously without blocking the app startup
    this.initializeTransporter().catch(error => {
      this.logger.warn('Email service initialization failed, but application will continue to run:', error.message);
    });
  }

  getHello(): string {
    return 'Hello World!';
  }

  private async initializeTransporter() {
  try {
    const emailConfig = getEmailConfig(this.configService);
    
    // Simplified transporter configuration - using Gmail
    this.transporter = nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure ?? (emailConfig.port === 465),
      auth: {
        user: emailConfig.auth.user,
        pass: emailConfig.auth.pass,
      }
    });
    
    // Simple verification
    await this.transporter.verify();
    this.logger.log('Email transporter initialized successfully');
  } catch (error) {
    this.logger.error('Failed to initialize email transporter:', error.message);
    if (error.code === 'EAUTH') {
      this.logger.error('Authentication failed. Check your Gmail credentials or App Password.');
    }
    throw error;
  }
}

/**
 * Send email using nodemailer with minimal retry logic
 */
  private async sendEmail(to: string, subject: string, html: string, text: string, retryCount = 0): Promise<void> {
    const maxRetries = 1;
    
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

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error.message);
      
      // Simple retry for network-related errors
      if (retryCount < maxRetries && ['ETIMEDOUT', 'ECONNRESET', 'ECONNREFUSED'].includes(error.code)) {
        this.logger.log(`Retrying email send to ${to}...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.sendEmail(to, subject, html, text, retryCount + 1);
      }
      
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
  async sendPasswordResetEmail(email: string, userName: string, resetUrl: string): Promise<void> {
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
