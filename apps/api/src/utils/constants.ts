/**
 * Application constants
 */
export const APP_CONSTANTS = {
  // JWT Configuration
  JWT: {
    EXPIRES_IN: '1h',
    ALGORITHM: 'HS256',
  },

  // Email Configuration
  EMAIL: {
    OTP_EXPIRY_MINUTES: 10,
    PASSWORD_RESET_EXPIRY_HOURS: 1,
    MAX_RETRIES: 1,
    RETRY_DELAY_MS: 1000,
  },

  // OTP Configuration
  OTP: {
    EXPIRY_MINUTES: 10,
    LENGTH: 6,
    MAX_ATTEMPTS: 3,
  },

  // Database Configuration
  DATABASE: {
    POOL_MAX: 20,
    POOL_IDLE_TIMEOUT: 30000,
    CONNECTION_TIMEOUT: 2000,
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },

  // File Upload
  FILE_UPLOAD: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  },

  // Validation
  VALIDATION: {
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_MAX_LENGTH: 128,
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 100,
    EMAIL_MAX_LENGTH: 255,
    PHONE_MAX_LENGTH: 20,
  },

  // Roles
  ROLES: {
    ADMIN: 'admin',
    CHILDREN: 'children',
    COACH: 'coach',
  },

  // HTTP Status Messages
  MESSAGES: {
    SUCCESS: {
      USER_CREATED: 'User created successfully',
      USER_UPDATED: 'User updated successfully',
      USER_DELETED: 'User deleted successfully',
      EMAIL_VERIFIED: 'Email verified successfully',
      PASSWORD_RESET: 'Password reset successfully',
      LOGIN_SUCCESS: 'Login successful',
      LOGOUT_SUCCESS: 'Logout successful',
    },
    ERROR: {
      USER_NOT_FOUND: 'User not found',
      INVALID_CREDENTIALS: 'Invalid credentials',
      EMAIL_ALREADY_EXISTS: 'Email already exists',
      INVALID_OTP: 'Invalid OTP',
      OTP_EXPIRED: 'OTP has expired',
      TOKEN_EXPIRED: 'Token expired',
      UNAUTHORIZED: 'Unauthorized access',
      FORBIDDEN: 'Access forbidden',
      VALIDATION_FAILED: 'Validation failed',
      INTERNAL_SERVER_ERROR: 'Internal server error',
    },
  },
} as const;

export enum MESSAGE_CONTENT_TYPE {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  LINK = 'link',
  ATTACHMENT = 'attachment',
  OTHER = 'other',
}

export enum GROUP_SESSION_DAY {
  MONDAY = 'Monday',
  TUESDAY = 'Tuesday',
  WEDNESDAY = 'Wednesday',
  THURSDAY = 'Thursday',
  FRIDAY = 'Friday',
  SATURDAY = 'Saturday',
  SUNDAY = 'Sunday',
}

export enum EVENT_TYPE {
  TRAINING = 'training',
  ONE_TIME = 'one_time',
}

export enum ATTENDANCE_STATUS {
  ABSENT = 'absent',
  PRESENT = 'present',
  LATE = 'late',
}

export enum INSURANCE_STATUS {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  EXPIRED = 'expired',
  REJECTED = 'rejected',
}

export enum INSURANCE_COVERAGE_TYPE {
  TRAINING_AND_TOURNAMENT = 'training_and_tournament',
}

export enum ChildrenInvoiceStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  CANCELED = 'canceled',
}
