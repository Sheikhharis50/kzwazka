import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { v4 as uuidv4 } from 'uuid';
import { DatabaseService } from "src/db/drizzle.service";
import { eq } from 'drizzle-orm';
import { SignUpDto } from "./dto/create-auth.dto";
import { VerifyOtpDto, LoginDto } from "./dto/verify-otp.dto";
import { roleSchema, userSchema } from "src/db/schemas";
import { UserService } from "../user/user.service";
import { ChildrenService } from "../children/children.service";

import { EmailService } from "./email.service";
import { generateToken } from './auth.utils';

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
    const { email, password, first_name, last_name, dob, parent_first_name, parent_last_name } = signUpDto;

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
      role_id: childRole.id,
      is_active: true,
      is_verified: false, // Will be verified after OTP confirmation
    });

    // Create child record
    const newChild = await this.childrenService.create({
      user_id: newUser.id,
      dob,
      parent_first_name,
      parent_last_name,
    });

    // Generate OTP for email verification
    const otp = await this.generateAndStoreOTP(newUser.id);

    // Send OTP email
    try {
      await this.emailService.sendOtpEmail(email, otp, first_name);
    } catch (error) {
      // Don't fail the signup process if email fails
      // The OTP is still generated and stored
    }

    return {
      message: 'User created successfully. Please verify your email with the OTP sent to your email address.',
      user: {
        id: newUser.id,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        role: childRole.name,
        is_verified: false,
      },
      child: newChild,
      requiresVerification: true,
    };
  }

  async verifyOtp(userId: string, verifyOtpDto: VerifyOtpDto) {
    const { otp } = verifyOtpDto;

    // Verify OTP
    const isValidOtp = await this.verifyOTP(userId, otp);
    if (!isValidOtp) {
      throw new BadRequestException('Invalid OTP');
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
      await this.emailService.sendWelcomeEmail(userData.email, userData.first_name);
    } catch (error) {
      // Don't fail the verification process if email fails
    }

    // Generate JWT token (only contains user ID)
    const access_token = generateToken(
      this.jwtService,
      userData.id
    );

    return {
      message: 'Email verified successfully',
      access_token,
      user: {
        id: userData.id,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: role[0]?.name || 'children',
        is_verified: true,
      },
    };
  }

  async resendOtp(userId: string) {
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
    } catch (error) {
      throw new BadRequestException('Failed to send OTP email. Please try again later.');
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
      throw new UnauthorizedException('Please use your OAuth provider to sign in');
    }

    // Verify password
    const isPasswordValid = await this.userService.verifyPassword(user.id, password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is verified (for non-OAuth users)
    if (!user.is_verified) {
      throw new UnauthorizedException('Please verify your email before signing in');
    }

    // Get role name
    const role = await this.db.db
      .select({ name: roleSchema.name })
      .from(roleSchema)
      .where(eq(roleSchema.id, user.role_id))
      .limit(1);

    // Generate JWT token (only contains user ID)
    const access_token = generateToken(
      this.jwtService,
      user.id
    );
    
    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: role[0]?.name || 'children',
        is_verified: user.is_verified,
      },
    };
  }

  async getProfile(userId: string) {
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
      children: children,
    };
  }

  async validateChildOAuthLogin(userData: any, provider: string) {
    const { email, firstName, lastName, picture, id: googleId } = userData;
    
    // Check if user already exists by email
    const existingUser = await this.userService.findByEmail(email);

    if (existingUser) {
      // Scenario 1: User exists with password-based authentication
      if (existingUser.password !== null) {
        throw new UnauthorizedException('An account with this email already exists. Please sign in with your password.');
      }
      
      // Scenario 2: User exists with Google OAuth but different Google ID
      if (provider === 'google' && existingUser.google_social_id && existingUser.google_social_id !== googleId) {
        throw new UnauthorizedException('This email is already associated with a different Google account. Please use the correct Google account.');
      }
      
      // Scenario 3: User exists with Google OAuth and same Google ID - update info if needed
      if (provider === 'google' && existingUser.google_social_id === googleId) {
        // Update user information if it has changed
        const updates: any = {};
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
          id: existingUser.id,
          email: existingUser.email,
          first_name: firstName,
          last_name: lastName,
          role: role[0]?.name || 'children',
          provider,
          is_verified: true, // OAuth users are automatically verified
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
      google_social_id: provider === 'google' ? googleId : null
    });

    // Create child record
    const newChild = await this.childrenService.create({
      user_id: newUser.id,
      dob: new Date().toISOString(), // Temporary date that will be updated later
      photo_url: picture,
      parent_first_name: '', // Empty string instead of null
      parent_last_name: '', // Empty string instead of null
    });

    return {
      id: newUser.id,
      email: newUser.email,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      role: childRole.name,
      provider,
      is_verified: true, // OAuth users are automatically verified
    };
  }

  generateTokenForOAuthUser(user: any) {
    return generateToken(
      this.jwtService,
      user.id
    );
  }

  // OTP Methods (moved from OtpService)

  /**
   * Generate a random 6-digit OTP
   */
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Store OTP in user record
   */
  async storeOTP(userId: string, otp: string): Promise<void> {
    await this.db.db
      .update(userSchema)
      .set({
        otp,
        updated_at: new Date(),
      })
      .where(eq(userSchema.id, userId));
  }

  /**
   * Generate and store OTP for user
   */
  async generateAndStoreOTP(userId: string): Promise<string> {
    const otp = this.generateOTP();
    await this.storeOTP(userId, otp);
    return otp;
  }

  /**
   * Verify OTP for user
   */
  async verifyOTP(userId: string, otp: string): Promise<boolean> {
    const user = await this.db.db
      .select({ otp: userSchema.otp })
      .from(userSchema)
      .where(eq(userSchema.id, userId))
      .limit(1);

    if (user.length === 0 || !user[0].otp) {
      return false;
    }

    return user[0].otp === otp;
  }

  /**
   * Mark user as verified and clear OTP
   */
  async markUserAsVerified(userId: string): Promise<void> {
    await this.db.db
      .update(userSchema)
      .set({
        is_verified: true,
        otp: null,
        updated_at: new Date(),
      })
      .where(eq(userSchema.id, userId));
  }

  /**
   * Clear OTP for user (after successful verification or expiration)
   */
  async clearOTP(userId: string): Promise<void> {
    await this.db.db
      .update(userSchema)
      .set({
        otp: null,
        updated_at: new Date(),
      })
      .where(eq(userSchema.id, userId));
  }

  /**
   * Check if user is verified
   */
  async isUserVerified(userId: string): Promise<boolean> {
    const user = await this.db.db
      .select({ is_verified: userSchema.is_verified })
      .from(userSchema)
      .where(eq(userSchema.id, userId))
      .limit(1);

    return user.length > 0 && user[0].is_verified === true;
  }
}