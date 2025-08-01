import { Injectable, UnauthorizedException, ConflictException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { v4 as uuidv4 } from 'uuid';
import { DrizzleService } from "src/db/drizzle.service";
import { eq } from 'drizzle-orm';
import { SignUpDto } from "./dto/create-auth.dto";
import { childrenSchema, roleSchema, userSchema } from "src/db/schemas";
import { 
  hashPassword, 
  verifyPassword, 
  getChildRoleId, 
  getUserByEmail, 
  generateToken 
} from './auth.utils';

@Injectable()
export class AuthService {
  constructor(
    private readonly drizzle: DrizzleService,
    private jwtService: JwtService
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const { email, password, first_name, last_name, dob, parent_first_name, parent_last_name } = signUpDto;

    // Check if user already exists
    const existingUser = await getUserByEmail(this.drizzle, email);

    if (existingUser.length > 0) {
      throw new ConflictException('User already exists');
    }

    // Get the "child" role
    const childRole = await getChildRoleId(this.drizzle);

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const userId = uuidv4();
    const newUser = await this.drizzle.db
      .insert(userSchema)
      .values({
        id: userId,
        email,
        password: hashedPassword,
        first_name,
        last_name,
        role_id: childRole.id,
        is_active: true,
        is_verified: false,
      })
      .returning();

    // Create child record
    const newChild = await this.drizzle.db
      .insert(childrenSchema)
      .values({
        id: uuidv4(),
        user_id: userId,
        dob: new Date(dob).toISOString(),
        parent_first_name,
        parent_last_name,
      })
      .returning();

    // Generate JWT token
    const access_token = generateToken(
      this.jwtService,
      newUser[0].id,
      newUser[0].email,
      childRole.name
    );
    
    return {
      access_token,
      user: {
        id: newUser[0].id,
        email: newUser[0].email,
        first_name: newUser[0].first_name,
        last_name: newUser[0].last_name,
        role: childRole.name,
      },
      child: newChild[0],
    };
  }

  async signIn(signInDto: any) {
    const { email, password } = signInDto;

    // Find user with role
    const user = await this.drizzle.db
      .select({
        id: userSchema.id,
        email: userSchema.email,
        password: userSchema.password,
        first_name: userSchema.first_name,
        last_name: userSchema.last_name,
        is_active: userSchema.is_active,
        role_name: roleSchema.name,
        role_id: roleSchema.id,
      })
      .from(userSchema)
      .innerJoin(roleSchema, eq(userSchema.role_id, roleSchema.id))
      .where(eq(userSchema.email, email))
      .limit(1);

    if (user.length === 0) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const userData = user[0];

    if (!userData.is_active) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Check if user has a password (might be null for OAuth users)
    if (userData.password === null) {
      throw new UnauthorizedException('Please use your OAuth provider to sign in');
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, userData.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const access_token = generateToken(
      this.jwtService,
      userData.id,
      userData.email,
      userData.role_name
    );
    
    return {
      access_token,
      user: {
        id: userData.id,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: userData.role_name,
      },
    };
  }

  async getProfile(userId: string) {
    const user = await this.drizzle.db
      .select({
        id: userSchema.id,
        email: userSchema.email,
        first_name: userSchema.first_name,
        last_name: userSchema.last_name,
        role_name: roleSchema.name,
      })
      .from(userSchema)
      .innerJoin(roleSchema, eq(userSchema.role_id, roleSchema.id))
      .where(eq(userSchema.id, userId))
      .limit(1);

    if (user.length === 0) {
      throw new UnauthorizedException('User not found');
    }

    return user[0];
  }

  async getChildren(userId: string) {
    const childrenData = await this.drizzle.db
      .select({
        id: childrenSchema.id,
        dob: childrenSchema.dob,
        photo_url: childrenSchema.photo_url,
        parent_first_name: childrenSchema.parent_first_name,
        parent_last_name: childrenSchema.parent_last_name,
        user: {
          id: userSchema.id,
          first_name: userSchema.first_name,
          last_name: userSchema.last_name,
          email: userSchema.email,
        },
      })
      .from(childrenSchema)
      .innerJoin(userSchema, eq(childrenSchema.user_id, userSchema.id))
      .where(eq(childrenSchema.user_id, userId));

    return childrenData;
  }

  async validateChildOAuthLogin(userData: any, provider: string) {
    const { email, firstName, lastName, picture, id: googleId } = userData;
    
    // Check if user already exists by email
    const existingUser = await getUserByEmail(this.drizzle, email);

    if (existingUser.length > 0) {
      const user = existingUser[0];
      
      // Scenario 1: User exists with password-based authentication
      if (user.password !== null) {
        throw new UnauthorizedException('An account with this email already exists. Please sign in with your password.');
      }
      
      // Scenario 2: User exists with Google OAuth but different Google ID
      if (provider === 'google' && user.google_social_id && user.google_social_id !== googleId) {
        throw new UnauthorizedException('This email is already associated with a different Google account. Please use the correct Google account.');
      }
      
      // Scenario 3: User exists with Google OAuth and same Google ID - update info if needed
      if (provider === 'google' && user.google_social_id === googleId) {
        // Update user information if it has changed
        const updates: any = {};
        let hasUpdates = false;
        
        if (user.first_name !== firstName) {
          updates.first_name = firstName;
          hasUpdates = true;
        }
        
        if (user.last_name !== lastName) {
          updates.last_name = lastName;
          hasUpdates = true;
        }
        
        // Update user if there are changes
        if (hasUpdates) {
          await this.drizzle.db
            .update(userSchema)
            .set(updates)
            .where(eq(userSchema.id, user.id));
        }
        
        // Get the role name for the response
        const role = await this.drizzle.db
          .select({ name: roleSchema.name })
          .from(roleSchema)
          .where(eq(roleSchema.id, user.role_id))
          .limit(1);
        
        return {
          id: user.id,
          email: user.email,
          first_name: firstName,
          last_name: lastName,
          role: role[0]?.name || 'children',
          provider,
        };
      }
      
      // Scenario 4: User exists but no Google ID set - link the account
      if (provider === 'google' && !user.google_social_id) {
        // Update user with Google ID and verify the account
        await this.drizzle.db
          .update(userSchema)
          .set({
            google_social_id: googleId,
            is_verified: true,
            first_name: firstName,
            last_name: lastName
          })
          .where(eq(userSchema.id, user.id));
        
        // Get the role name for the response
        const role = await this.drizzle.db
          .select({ name: roleSchema.name })
          .from(roleSchema)
          .where(eq(roleSchema.id, user.role_id))
          .limit(1);
        
        return {
          id: user.id,
          email: user.email,
          first_name: firstName,
          last_name: lastName,
          role: role[0]?.name || 'children',
          provider,
        };
      }
    }

    // Scenario 5: User doesn't exist - create new user
    const childRole = await getChildRoleId(this.drizzle);

    // Create new user
    const userId = uuidv4();
    const newUser = await this.drizzle.db
      .insert(userSchema)
      .values({
        id: userId,
        email,
        password: null, // OAuth users don't have passwords
        first_name: firstName,
        last_name: lastName,
        role_id: childRole.id,
        is_active: true,
        is_verified: true, // Already verified through OAuth
        google_social_id: provider === 'google' ? googleId : null
      })
      .returning();

    // Create child record
    const newChild = await this.drizzle.db
      .insert(childrenSchema)
      .values({
        id: uuidv4(),
        user_id: userId,
        dob: new Date().toISOString(), // Temporary date that will be updated later
        photo_url: picture,
        location_id: undefined, // Optional field
        parent_first_name: '', // Empty string instead of null
        parent_last_name: '', // Empty string instead of null
      })
      .returning();

    return {
      id: newUser[0].id,
      email: newUser[0].email,
      first_name: newUser[0].first_name,
      last_name: newUser[0].last_name,
      role: childRole.name,
      provider,
    };
  }

  generateTokenForOAuthUser(user: any) {
    return generateToken(
      this.jwtService,
      user.id,
      user.email,
      user.role
    );
  }
}