import { ConfigService } from '@nestjs/config';

/**
 * Email configuration interface
 */
export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}

/**
 * Application configuration interface
 */
export interface AppConfig {
  email: EmailConfig;
  frontendUrl: string;
  jwtSecret: string;
  databaseUrl: string;
  googleClientId: string;
  googleClientSecret: string;
  googleCallbackUrl: string;
}

/**
 * Get email configuration from environment variables
 */
export function getEmailConfig(configService: ConfigService): EmailConfig {
  const host = configService.get<string>('EMAIL_HOST');
  const port = configService.get<number>('EMAIL_PORT');
  const secure = configService.get<boolean>('EMAIL_SECURE', false);
  const user = configService.get<string>('EMAIL_USER');
  const pass = configService.get<string>('EMAIL_PASS');
  const from = configService.get<string>('EMAIL_FROM') || user; // Use user email as fallback for from

  if (!host || !port || !user || !pass) {
    throw new Error('Missing required email configuration. Please check your environment variables.');
  }

  // Auto-detect secure setting based on port
  let finalSecure = secure;
  if (port === 465) {
    finalSecure = true; // Port 465 requires SSL/TLS
  } else if (port === 587) {
    finalSecure = false; // Port 587 uses STARTTLS
  }

  return {
    host,
    port,
    secure: finalSecure,
    auth: {
      user,
      pass,
    },
    from: from || user, // Ensure from is always set
  };
}

/**
 * Get application configuration
 */
export function getAppConfig(configService: ConfigService): AppConfig {
  const databaseUrl = configService.get<string>('DATABASE_URL');
  const googleClientId = configService.get<string>('GOOGLE_CLIENT_ID');
  const googleClientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');

  if (!databaseUrl || !googleClientId || !googleClientSecret) {
    throw new Error('Missing required application configuration. Please check your environment variables.');
  }

  return {
    email: getEmailConfig(configService),
    frontendUrl: configService.get<string>('FRONTEND_URL', 'http://localhost:3000'),
    jwtSecret: configService.get<string>('JWT_SECRET', 'fallback-secret-key'),
    databaseUrl,
    googleClientId,
    googleClientSecret,
    googleCallbackUrl: configService.get<string>('GOOGLE_CALLBACK_URL', 'http://localhost:8000/api/auth/google/callback'),
  };
}

/**
 * Validate email configuration
 */
export function validateEmailConfig(config: EmailConfig): boolean {
  return !!(config.host && config.port && config.auth.user && config.auth.pass && config.from);
}

/**
 * Generate email templates
 */
export const emailTemplates = {
  otp: (userName: string, otp: string) => ({
    subject: 'Email Verification - Kzwazka',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Email Verification</h2>
        <p>Hello ${userName},</p>
        <p>Thank you for signing up with Kzwazka! Please use the following OTP to verify your email address:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #007bff; font-size: 32px; margin: 0;">${otp}</h1>
        </div>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this verification, please ignore this email.</p>
        <p>Best regards,<br>The Kzwazka Team</p>
      </div>
    `,
    text: `
      Email Verification - Kzwazka
      
      Hello ${userName},
      
      Thank you for signing up with Kzwazka! Please use the following OTP to verify your email address:
      
      ${otp}
      
      This OTP will expire in 10 minutes.
      
      If you didn't request this verification, please ignore this email.
      
      Best regards,
      The Kzwazka Team
    `
  }),

  welcome: (userName: string) => ({
    subject: 'Welcome to Kzwazka!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to Kzwazka!</h2>
        <p>Hello ${userName},</p>
        <p>Welcome to Kzwazka! Your email has been successfully verified and your account is now active.</p>
        <p>You can now log in to your account and start using our services.</p>
        <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
        <p>Best regards,<br>The Kzwazka Team</p>
      </div>
    `,
    text: `
      Welcome to Kzwazka!
      
      Hello ${userName},
      
      Welcome to Kzwazka! Your email has been successfully verified and your account is now active.
      
      You can now log in to your account and start using our services.
      
      If you have any questions or need assistance, please don't hesitate to contact our support team.
      
      Best regards,
      The Kzwazka Team
    `
  }),

  passwordReset: (userName: string, resetUrl: string) => ({
    subject: 'Password Reset Request - Kzwazka',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Hello ${userName},</p>
        <p>You requested a password reset for your Kzwazka account. Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        </div>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #007bff;">${resetUrl}</p>
        <p>This link will expire in 1 hour for security reasons.</p>
        <p>If you didn't request this password reset, please ignore this email and your password will remain unchanged.</p>
        <p>Best regards,<br>The Kzwazka Team</p>
      </div>
    `,
    text: `
      Password Reset Request - Kzwazka
      
      Hello ${userName},
      
      You requested a password reset for your Kzwazka account. Please visit the following link to reset your password:
      
      ${resetUrl}
      
      This link will expire in 1 hour for security reasons.
      
      If you didn't request this password reset, please ignore this email and your password will remain unchanged.
      
      Best regards,
      The Kzwazka Team
    `
  }),

  passwordResetConfirmation: (userName: string) => ({
    subject: 'Password Reset Successful - Kzwazka',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Successful</h2>
        <p>Hello ${userName},</p>
        <p>Your password has been successfully reset. You can now log in to your account with your new password.</p>
        <p>If you didn't request this password reset, please contact our support team immediately as your account may have been compromised.</p>
        <p>Best regards,<br>The Kzwazka Team</p>
      </div>
    `,
    text: `
      Password Reset Successful - Kzwazka
      
      Hello ${userName},
      
      Your password has been successfully reset. You can now log in to your account with your new password.
      
      If you didn't request this password reset, please contact our support team immediately as your account may have been compromised.
      
      Best regards,
      The Kzwazka Team
    `
  })
}; 