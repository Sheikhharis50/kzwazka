import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  HttpStatus,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiSecurity,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/create-auth.dto';
import { LoginDto } from './dto/login-auth.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/password.dto';
import { VerifyOtpDto } from './dto/otp.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @ApiOperation({
    summary: 'User registration',
    description: 'Create a new user account with email verification',
  })
  @ApiBody({
    type: SignUpDto,
    description: 'User registration data',
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully. Check email for verification.',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'User registered successfully' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            email: { type: 'string', example: 'john.doe@example.com' },
            first_name: { type: 'string', example: 'John' },
            last_name: { type: 'string', example: 'Doe' },
            role: { type: 'string', example: 'user' },
            is_verified: { type: 'boolean', example: false },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or user already exists',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async signUp(@Body() body: SignUpDto) {
    return await this.authService.signUp(body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-otp')
  @ApiOperation({
    summary: 'Verify OTP',
    description: 'Verify the OTP sent to user email for account verification',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiBody({
    type: VerifyOtpDto,
    description: 'OTP verification data',
  })
  @ApiResponse({
    status: 200,
    description: 'OTP verified successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'OTP verified successfully' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            is_verified: { type: 'boolean', example: true },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid OTP or validation error',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async verifyOtp(@Body() body: VerifyOtpDto, @Req() req: any) {
    return await this.authService.verifyOtp(req.user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('resend-otp')
  @ApiOperation({
    summary: 'Resend OTP',
    description: 'Resend OTP to user email for account verification',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'OTP resent successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'OTP resent successfully' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async resendOtp(@Req() req: any) {
    return await this.authService.resendOtp(req.user.id);
  }

  @Post('login')
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticate user with email and password',
  })
  @ApiBody({
    type: LoginDto,
    description: 'User login credentials',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Login successful' },
        access_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            email: { type: 'string', example: 'john.doe@example.com' },
            first_name: { type: 'string', example: 'John' },
            last_name: { type: 'string', example: 'Doe' },
            role: { type: 'string', example: 'user' },
            is_verified: { type: 'boolean', example: true },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async signIn(@Body() body: LoginDto) {
    return this.authService.signIn(body);
  }

  @Post('forgot-password')
  @ApiOperation({
    summary: 'Forgot password',
    description: 'Send password reset link to user email',
  })
  @ApiBody({
    type: ForgotPasswordDto,
    description: 'Email for password reset',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Password reset email sent' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    return await this.authService.forgotPassword(body);
  }

  @Post('reset-password')
  @ApiOperation({
    summary: 'Reset password',
    description: 'Reset user password using reset token',
  })
  @ApiBody({
    type: ResetPasswordDto,
    description: 'Password reset data',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset successful',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Password reset successful' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or invalid token',
  })
  @ApiResponse({
    status: 404,
    description: 'Invalid or expired token',
  })
  async resetPassword(@Body() body: ResetPasswordDto) {
    return await this.authService.resetPassword(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({
    summary: 'Get user profile',
    description: 'Get current authenticated user profile information',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        email: { type: 'string', example: 'john.doe@example.com' },
        first_name: { type: 'string', example: 'John' },
        last_name: { type: 'string', example: 'Doe' },
        role: { type: 'string', example: 'user' },
        is_verified: { type: 'boolean', example: true },
        phone: { type: 'string', example: '+1-555-123-4567' },
        photo_url: {
          type: 'string',
          example: 'https://example.com/photos/profile.jpg',
        },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async getProfile(@Req() req: any) {
    return this.authService.getProfile(req.user.id);
  }

  @Post('google')
  @ApiOperation({
    summary: 'Google OAuth with ID token',
    description: 'Authenticate user using Google ID token from frontend',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        idToken: { type: 'string', description: 'Google ID token (JWT)' },
      },
      required: ['idToken'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Google OAuth authentication successful',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Login successful' },
        token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            email: { type: 'string', example: 'john.doe@gmail.com' },
            first_name: { type: 'string', example: 'John' },
            last_name: { type: 'string', example: 'Doe' },
            role: { type: 'string', example: 'user' },
            is_verified: { type: 'boolean', example: true },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid ID token or validation error',
  })
  @ApiResponse({
    status: 401,
    description: 'Google OAuth authentication failed',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async googleAuthWithIdToken(@Body() body: { code: string }) {
    try {
      const result = await this.authService.authenticateWithGoogleIdToken(
        body.code
      );
      return {
        message: 'Login successful',
        access_token: result.access_token,
        user: result.user,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Google authentication failed');
    }
  }
}
