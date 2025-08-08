/**
 * Email template interface
 */
export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

/**
 * Generate email templates
 */
export const emailTemplates = {
  otp: (userName: string, otp: string): EmailTemplate => ({
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
    `,
  }),

  welcome: (userName: string): EmailTemplate => ({
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
    `,
  }),

  passwordReset: (userName: string, resetUrl: string): EmailTemplate => ({
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
    `,
  }),

  passwordResetConfirmation: (userName: string): EmailTemplate => ({
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
    `,
  }),
};
