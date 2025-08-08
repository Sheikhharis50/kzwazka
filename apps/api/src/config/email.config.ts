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
    throw new Error(
      'Missing required email configuration. Please check your environment variables.'
    );
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
 * Validate email configuration
 */
export function validateEmailConfig(config: EmailConfig): boolean {
  return !!(
    config.host &&
    config.port &&
    config.auth.user &&
    config.auth.pass &&
    config.from
  );
}
