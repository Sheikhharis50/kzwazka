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
import { roleSchema, userSchema, rolePermissionSchema } from 'src/db/schemas';
import { UserService } from '../user/user.service';
import { ChildrenService } from '../children/children.service';
import { EmailService } from '../services/email.service';
import { APP_CONSTANTS } from '../utils/constants';
import { Logger } from '@nestjs/common';
import { FileStorageService } from '../services';

import {
  generateToken,
  generatePasswordResetToken,
  hashResetToken,
  generateResetUrl,
  isResetTokenExpired,
  generateOTP,
  isOTPExpired,
} from '../utils/auth.utils';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly dbService: DatabaseService,
    private readonly userService: UserService,
    private readonly childrenService: ChildrenService,
    private readonly emailService: EmailService,
    private readonly fileStorageService: FileStorageService,
    private jwtService: JwtService
  ) {}

  async signUp(signUpDto: SignUpDto, photo_url?: Express.Multer.File) {
    const {
      email,
      password,
      first_name,
      last_name,
      dob,
      phone,
      parent_first_name,
      parent_last_name,
    } = signUpDto;

    // Check if user already exists
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    // Get the "children" role
    const childrenRole = await this.userService.getRoleByName('children');
    if (!childrenRole) {
      throw new Error('Children role not found. Please seed the database.');
    }

    // Handle photo upload if provided
    let photo_url_path: string | undefined;
    if (photo_url) {
      try {
        // Upload photo to storage (will use local or DigitalOcean based on environment)
        const uploadResult = await this.fileStorageService.uploadFile(
          photo_url,
          'avatars',
          Date.now() // Use timestamp as temporary ID for upload
        );
        photo_url_path = uploadResult.relativePath;
      } catch (error) {
        this.logger.error(
          `Failed to upload photo: ${(error as Error).message}`
        );
        throw new BadRequestException(
          `Failed to upload photo: ${(error as Error).message}`
        );
      }
    }

    // Create both user and children in a single transaction
    const { user: newUser, children: newChildren } =
      await this.childrenService.create({
        email,
        password,
        first_name,
        last_name,
        phone,
        role_id: childrenRole.id,
        is_active: true,
        is_verified: false, // Will be verified after OTP confirmation
        dob,
        photo_url: photo_url_path || undefined,
        parent_first_name,
        parent_last_name,
      });

    const access_token = generateToken(this.jwtService, newUser.id);

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
          role: childrenRole.name,
          is_verified: newUser.is_verified,
        },
        children: newChildren,
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
    const user = await this.dbService.db
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
    const role = await this.dbService.db
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
    const role = await this.dbService.db
      .select({ name: roleSchema.name })
      .from(roleSchema)
      .where(eq(roleSchema.id, user.role_id))
      .limit(1);

    const access_token = generateToken(this.jwtService, user.id);
    // Check if user is verified
    if (!user.is_verified) {
      const newOtp = await this.generateAndStoreOTP(user.id);

      // Send new OTP email
      try {
        await this.emailService.sendOtpEmail(
          user.email,
          newOtp,
          user.first_name
        );
      } catch (error) {
        this.logger.error('Failed to send OTP email during sign in:', error);
        throw new BadRequestException(
          'Login successful but failed to send verification OTP. Please try resending OTP.'
        );
      }
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
            is_active: user.is_active,
            created_at: user.created_at,
            updated_at: user.updated_at,
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
          is_active: user.is_active,
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
      },
    };
  }

  async getProfile(userId: number) {
    // Get user with role information and permissions in a single query
    const user = await this.dbService.db
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
        permission_ids: rolePermissionSchema.permission_id,
      })
      .from(userSchema)
      .innerJoin(roleSchema, eq(userSchema.role_id, roleSchema.id))
      .leftJoin(
        rolePermissionSchema,
        eq(roleSchema.id, rolePermissionSchema.role_id)
      )
      .where(eq(userSchema.id, userId));

    if (user.length === 0) {
      throw new UnauthorizedException('User not found');
    }

    const userData = user[0];

    // Extract unique permission IDs from the results
    const permissionIds = [
      ...new Set(user.map((row) => row.permission_ids).filter(Boolean)),
    ];

    // Get children data for this user
    const children = await this.childrenService.findByUserId(userId);

    const childrenwithphotoUrl = {
      ...children[0],
      user: {
        ...children[0].user,
        photo_url: children[0].user?.photo_url
          ? this.fileStorageService.getPhotoUrlforAPIResponse(
              children[0].user.photo_url
            )
          : children[0].user?.photo_url,
      },
    };

    // Return consistent structure with user object, permissions, and related data
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
          permissions: permissionIds,
        },
        children: childrenwithphotoUrl,
      },
    };
  }

  // OTP Methods (updated with expiration)

  /**
   * Store OTP in user record with creation timestamp
   */
  async storeOTP(userId: number, otp: string): Promise<void> {
    await this.dbService.db
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
    const user = await this.dbService.db
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
    await this.dbService.db
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
    await this.dbService.db
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
    const user = await this.dbService.db
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
    await this.dbService.db
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
    const { token, password, confirm_password } = resetPasswordDto;

    // Validate password confirmation
    if (password !== confirm_password) {
      throw new BadRequestException('Passwords do not match');
    }

    // Find user with this reset token
    const users = await this.dbService.db
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
    await this.dbService.db
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
    await this.dbService.db
      .update(userSchema)
      .set({
        token: null,
        updated_at: new Date(),
      })
      .where(eq(userSchema.id, userId));
  }
}
