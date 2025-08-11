import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../db/drizzle.service';
import { eq } from 'drizzle-orm';
import { SignUpDto } from './dto/create-auth.dto';
import { LoginDto } from './dto/login-auth.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/password.dto';
import { VerifyOtpDto } from './dto/otp.dto';
import { roleSchema, userSchema } from 'src/db/schemas';
import { UserService } from '../user/user.service';
import { ChildrenService } from '../children/children.service';
import { EmailService } from '../services/email.service';
import { APP_CONSTANTS } from '../utils/constants';

import {
  generateToken,
  generatePasswordResetToken,
  hashResetToken,
  generateResetUrl,
  isResetTokenExpired,
  generateOTP,
  isOTPExpired,
} from '../utils/auth.utils';

// Interface for OAuth user data
interface OAuthUserData {
  email: string;
  firstName: string;
  lastName: string;
  picture?: string;
  id: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly userService: UserService,
    private readonly childrenService: ChildrenService,
    private readonly emailService: EmailService,
    private jwtService: JwtService
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const {
      email,
      password,
      first_name,
      last_name,
      dob,
      phone,
      photo_url,
      parent_first_name,
      parent_last_name,
    } = signUpDto;

    // Check if user already exists
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    // Get the "child" role
    const childRole = await this.userService.getRoleByName('children');
    if (!childRole) {
      throw new Error('Child role not found. Please seed the database.');
    }

    // Create user (not verified initially)
    const newUser = await this.userService.create({
      email,
      password,
      first_name,
      last_name,
      phone,
      role_id: childRole.id,
      is_active: true,
      is_verified: false, // Will be verified after OTP confirmation
    });

    const access_token = generateToken(this.jwtService, newUser.id);

    // Create child record
    const newChild = await this.childrenService.create({
      user_id: newUser.id,
      dob,
      photo_url,
      parent_first_name,
      parent_last_name,
    });

    // Generate OTP for email verification
    const otp = await this.generateAndStoreOTP(newUser.id);

    // Send OTP email
    try {
      await this.emailService.sendOtpEmail(email, otp, first_name);
    } catch {
      // Don't fail the signup process if email fails
      // The OTP is still generated and stored
    }

    return {
      message:
        'User created successfully. Please verify your email with the OTP sent to your email address.',
      data: {
        access_token,
        user: {
          id: newUser.id,
          email: newUser.email,
          first_name: newUser.first_name,
          last_name: newUser.last_name,
          role: childRole.name,
          is_verified: newUser.is_verified,
        },
        child: newChild,
      },
    };
  }

  async verifyOtp(userId: number, verifyOtpDto: VerifyOtpDto) {
    const { otp } = verifyOtpDto;

    // Verify OTP
    const isValidOtp = await this.verifyOTP(userId, otp);
    if (!isValidOtp) {
      throw new BadRequestException(APP_CONSTANTS.MESSAGES.ERROR.INVALID_OTP);
    }

    // Mark user as verified
    await this.markUserAsVerified(userId);

    // Get user details with role_id
    const user = await this.db.db
      .select({
        id: userSchema.id,
        email: userSchema.email,
        first_name: userSchema.first_name,
        last_name: userSchema.last_name,
        role_id: userSchema.role_id,
        is_verified: userSchema.is_verified,
      })
      .from(userSchema)
      .where(eq(userSchema.id, userId))
      .limit(1);

    if (user.length === 0) {
      throw new BadRequestException('User not found');
    }

    const userData = user[0];

    // Get role name
    const role = await this.db.db
      .select({ name: roleSchema.name })
      .from(roleSchema)
      .where(eq(roleSchema.id, userData.role_id))
      .limit(1);

    // Send welcome email
    try {
      await this.emailService.sendWelcomeEmail(
        userData.email,
        userData.first_name
      );
    } catch {
      // Don't fail the verification process if email fails
    }

    // Generate JWT token (only contains user ID)

    return {
      message: 'Email verified successfully',
      data: {
        user: {
          id: userData.id,
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          role: role[0]?.name || 'children',
          is_verified: true,
        },
      },
    };
  }

  async resendOtp(userId: number) {
    // Check if user exists and is not verified
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.is_verified) {
      throw new BadRequestException('User is already verified');
    }

    // Generate new OTP
    const otp = await this.generateAndStoreOTP(userId);

    // Send new OTP email
    try {
      await this.emailService.sendOtpEmail(user.email, otp, user.first_name);
    } catch {
      throw new BadRequestException(
        'Failed to send OTP email. Please try again later.'
      );
    }

    return {
      message: 'OTP resent successfully. Please check your email.',
    };
  }

  async signIn(signInDto: LoginDto) {
    const { email, password } = signInDto;

    // Find user by email
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Check if user has a password (might be null for OAuth users)
    if (user.password === null) {
      throw new UnauthorizedException(
        'Please use your OAuth provider to sign in'
      );
    }

    // Verify password
    const isPasswordValid = await this.userService.verifyPassword(
      user.id,
      password
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Get role name
    const role = await this.db.db
      .select({ name: roleSchema.name })
      .from(roleSchema)
      .where(eq(roleSchema.id, user.role_id))
      .limit(1);

    const access_token = generateToken(this.jwtService, user.id);
    // Check if user is verified
    if (!user.is_verified) {
      // Return user data without token when unverified
      return {
        message: 'Please verify your email before signing in',
        data: {
          access_token,
          user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: role[0]?.name || 'children',
            is_verified: user.is_verified,
          },
        },
        requiresVerification: true,
      };
    }

    // Generate JWT token (only contains user ID) for verified users

    return {
      message: 'Login successful',
      data: {
        access_token,
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: role[0]?.name || 'children',
          is_verified: user.is_verified,
        },
      },
    };
  }

  async getProfile(userId: number) {
    // Get user with role information
    const user = await this.db.db
      .select({
        id: userSchema.id,
        email: userSchema.email,
        first_name: userSchema.first_name,
        last_name: userSchema.last_name,
        phone: userSchema.phone,
        is_active: userSchema.is_active,
        is_verified: userSchema.is_verified,
        role_id: userSchema.role_id,
        created_at: userSchema.created_at,
        updated_at: userSchema.updated_at,
        role_name: roleSchema.name,
      })
      .from(userSchema)
      .innerJoin(roleSchema, eq(userSchema.role_id, roleSchema.id))
      .where(eq(userSchema.id, userId))
      .limit(1);

    if (user.length === 0) {
      throw new UnauthorizedException('User not found');
    }

    const userData = user[0];

    // Get children data for this user
    const children = await this.childrenService.findByUserId(userId);

    // Return consistent structure with user object and related data
    return {
      message: 'Profile fetched successfully',
      data: {
        user: {
          id: userData.id,
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          phone: userData.phone,
          is_active: userData.is_active,
          is_verified: userData.is_verified,
          role: userData.role_name,
          created_at: userData.created_at,
          updated_at: userData.updated_at,
        },
        child: children[0],
      },
    };
  }

  async validateChildOAuthLogin(userData: OAuthUserData, provider: string) {
    const { email, firstName, lastName, picture, id: googleId } = userData;

    // Check if user already exists by email
    const existingUser = await this.userService.findByEmail(email);

    if (existingUser) {
      // Scenario 1: User exists with password-based authentication
      if (existingUser.password !== null) {
        throw new UnauthorizedException(
          'An account with this email already exists. Please sign in with your password.'
        );
      }

      // Scenario 2: User exists with Google OAuth but different Google ID
      if (
        provider === 'google' &&
        existingUser.google_social_id &&
        existingUser.google_social_id !== googleId
      ) {
        throw new UnauthorizedException(
          'This email is already associated with a different Google account. Please use the correct Google account.'
        );
      }

      // Scenario 3: User exists with Google OAuth and same Google ID - update info if needed
      if (provider === 'google' && existingUser.google_social_id === googleId) {
        // Update user information if it has changed
        const updates: Record<string, string> = {};
        let hasUpdates = false;

        if (existingUser.first_name !== firstName) {
          updates.first_name = firstName;
          hasUpdates = true;
        }

        if (existingUser.last_name !== lastName) {
          updates.last_name = lastName;
          hasUpdates = true;
        }

        // Update user if there are changes
        if (hasUpdates) {
          await this.userService.update(existingUser.id, updates);
        }

        // Get the role name for the response
        const role = await this.db.db
          .select({ name: roleSchema.name })
          .from(roleSchema)
          .where(eq(roleSchema.id, existingUser.role_id))
          .limit(1);

        return {
          id: existingUser.id,
          email: existingUser.email,
          first_name: firstName,
          last_name: lastName,
          role: role[0]?.name || 'children',
          provider,
          is_verified: existingUser.is_verified, // OAuth users are automatically verified
        };
      }

      // Scenario 4: User exists but no Google ID set - link the account
      if (provider === 'google' && !existingUser.google_social_id) {
        // Update user with Google ID and verify the account
        await this.userService.updateGoogleSocialId(existingUser.id, googleId);

        // Get the role name for the response
        const role = await this.db.db
          .select({ name: roleSchema.name })
          .from(roleSchema)
          .where(eq(roleSchema.id, existingUser.role_id))
          .limit(1);

        return {
          message: 'Google OAuth login successful',
          data: {
            id: existingUser.id,
            email: existingUser.email,
            first_name: firstName,
            last_name: lastName,
            role: role[0]?.name || 'children',
            provider,
            is_verified: true, // OAuth users are automatically verified
          },
        };
      }
    }

    // Scenario 5: User doesn't exist - create new user
    const childRole = await this.userService.getRoleByName('children');
    if (!childRole) {
      throw new Error('Child role not found. Please seed the database.');
    }

    // Create new user (OAuth users are automatically verified)
    const newUser = await this.userService.create({
      email,
      password: null, // OAuth users don't have passwords
      first_name: firstName,
      last_name: lastName,
      role_id: childRole.id,
      is_active: true,
      is_verified: true, // OAuth users are automatically verified
      google_social_id: provider === 'google' ? googleId : undefined,
    });

    // Create child record
    await this.childrenService.create({
      user_id: newUser.id,
      dob: new Date().toISOString(), // Temporary date that will be updated later
      photo_url: picture,
      parent_first_name: '', // Empty string instead of null
      parent_last_name: '', // Empty string instead of null
    });

    return {
      message: 'Google OAuth login successful',
      data: {
        id: newUser.id,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        role: childRole.name,
        provider,
        is_verified: true, // OAuth users are automatically verified
      },
    };
  }

  generateTokenForOAuthUser(user: { id: number }) {
    return generateToken(this.jwtService, user.id);
  }

  // OTP Methods (updated with expiration)

  /**
   * Store OTP in user record with creation timestamp
   */
  async storeOTP(userId: number, otp: string): Promise<void> {
    await this.db.db
      .update(userSchema)
      .set({
        otp,
        otp_created_at: new Date(),
        updated_at: new Date(),
      })
      .where(eq(userSchema.id, userId));
  }

  /**
   * Generate and store OTP for user
   */
  async generateAndStoreOTP(userId: number): Promise<string> {
    const otp = generateOTP();
    await this.storeOTP(userId, otp);
    return otp;
  }

  /**
   * Verify OTP for user with expiration check
   */
  async verifyOTP(userId: number, otp: string): Promise<boolean> {
    const user = await this.db.db
      .select({
        otp: userSchema.otp,
        otp_created_at: userSchema.otp_created_at,
      })
      .from(userSchema)
      .where(eq(userSchema.id, userId))
      .limit(1);

    if (user.length === 0 || !user[0].otp) {
      return false;
    }

    // Check if OTP has expired
    if (isOTPExpired(user[0].otp_created_at)) {
      throw new BadRequestException(APP_CONSTANTS.MESSAGES.ERROR.OTP_EXPIRED);
    }

    return user[0].otp === otp;
  }

  /**
   * Mark user as verified and clear OTP
   */
  async markUserAsVerified(userId: number): Promise<void> {
    await this.db.db
      .update(userSchema)
      .set({
        is_verified: true,
        otp: null,
        otp_created_at: null,
        updated_at: new Date(),
      })
      .where(eq(userSchema.id, userId));
  }

  /**
   * Clear OTP for user (after successful verification or expiration)
   */
  async clearOTP(userId: number): Promise<void> {
    await this.db.db
      .update(userSchema)
      .set({
        otp: null,
        otp_created_at: null,
        updated_at: new Date(),
      })
      .where(eq(userSchema.id, userId));
  }

  /**
   * Check if user is verified
   */
  async isUserVerified(userId: number): Promise<boolean> {
    const user = await this.db.db
      .select({ is_verified: userSchema.is_verified })
      .from(userSchema)
      .where(eq(userSchema.id, userId))
      .limit(1);

    return user.length > 0 && user[0].is_verified === true;
  }

  // Password Reset Methods

  /**
   * Initiate password reset process
   */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    // Find user by email
    const user = await this.userService.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not for security
      return {
        message:
          'If an account with this email exists, a password reset link has been sent.',
      };
    }

    // Check if user is active
    if (!user.is_active) {
      return {
        message:
          'If an account with this email exists, a password reset link has been sent.',
      };
    }

    // Generate secure reset token
    const resetToken = generatePasswordResetToken();
    const hashedToken = hashResetToken(resetToken);

    // Store hashed token in database
    await this.db.db
      .update(userSchema)
      .set({
        token: hashedToken,
        updated_at: new Date(),
      })
      .where(eq(userSchema.id, user.id));

    // Generate reset URL
    const resetUrl = generateResetUrl(resetToken);

    // Send password reset email
    try {
      await this.emailService.sendPasswordResetEmail(
        user.email,
        user.first_name,
        resetUrl
      );
    } catch (error) {
      // Log error but don't fail the request
      console.error('Failed to send password reset email:', error);
    }

    return {
      message:
        'If an account with this email exists, a password reset link has been sent.',
    };
  }

  /**
   * Reset password using reset token
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, password, confirmPassword } = resetPasswordDto;

    // Validate password confirmation
    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Find user with this reset token
    const users = await this.db.db
      .select({
        id: userSchema.id,
        email: userSchema.email,
        first_name: userSchema.first_name,
        token: userSchema.token,
        updated_at: userSchema.updated_at,
      })
      .from(userSchema)
      .where(eq(userSchema.token, hashResetToken(token)))
      .limit(1);

    if (users.length === 0) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const user = users[0];

    // Check if token has expired
    if (user.updated_at && isResetTokenExpired(user.updated_at)) {
      // Clear expired token
      await this.clearResetToken(user.id);
      throw new BadRequestException(
        'Reset token has expired. Please request a new one.'
      );
    }

    // Hash new password
    const hashedPassword = await this.userService.hashPassword(password);

    // Update user password and clear reset token
    await this.db.db
      .update(userSchema)
      .set({
        password: hashedPassword,
        token: null, // Clear the reset token
        updated_at: new Date(),
      })
      .where(eq(userSchema.id, user.id));

    // Send confirmation email
    try {
      await this.emailService.sendPasswordResetConfirmationEmail(
        user.email,
        user.first_name
      );
    } catch (error) {
      // Log error but don't fail the request
      console.error('Failed to send password reset confirmation email:', error);
    }

    return {
      message:
        'Password has been successfully reset. You can now log in with your new password.',
    };
  }

  /**
   * Clear reset token for user
   */
  private async clearResetToken(userId: number): Promise<void> {
    await this.db.db
      .update(userSchema)
      .set({
        token: null,
        updated_at: new Date(),
      })
      .where(eq(userSchema.id, userId));
  }
}
