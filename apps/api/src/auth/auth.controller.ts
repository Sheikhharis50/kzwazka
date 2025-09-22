import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  UnauthorizedException,
  UseInterceptors,
  UploadedFile,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { createImageUploadInterceptor } from '../utils/file-interceptor.utils';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/create-auth.dto';
import { LoginDto } from './dto/login-auth.dto';
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/password.dto';
import { VerifyOtpDto } from './dto/otp.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { APIRequest } from '../interfaces/request';
import { GoogleAuthService } from './google-auth.service';
import { UpdateUserDto } from '../user/dto/update-user.dto';
import { FileStorageService } from '../services/file-storage.service';
import { APIResponse } from 'src/utils/response';

@ApiTags('Authentication')
@Controller('api/auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private googleAuthService: GoogleAuthService,
    private fileStorageService: FileStorageService
  ) {}

  @Post('signup')
  @ApiOperation({
    summary: 'User registration',
    description:
      'Create a new user account with email verification and optional profile photo',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'john.doe@example.com' },
        password: { type: 'string', example: 'SecurePass123' },
        first_name: { type: 'string', example: 'John' },
        last_name: { type: 'string', example: 'Doe' },
        dob: { type: 'string', example: '1990-01-15' },
        phone: { type: 'string', example: '+1-555-123-4567' },
        parent_first_name: { type: 'string', example: 'Jane' },
        parent_last_name: { type: 'string', example: 'Doe' },
        photo_url: {
          type: 'string',
          format: 'binary',
          description: 'Profile photo (optional)',
        },
      },
      required: [
        'email',
        'password',
        'first_name',
        'last_name',
        'dob',
        'parent_first_name',
        'parent_last_name',
      ],
    },
  })
  @UseInterceptors(createImageUploadInterceptor('photo_url'))
  @ApiResponse({
    status: 201,
    description: 'User registered successfully. Check email for verification.',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'User registered successfully' },
        data: {
          type: 'object',
          properties: {
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
                role: { type: 'string', example: 'children' },
                is_verified: { type: 'boolean', example: false },
              },
            },
            children: {
              type: 'object',
              description: 'Children information',
            },
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
  async signUp(
    @Body() body: SignUpDto,
    @UploadedFile() photo?: Express.Multer.File
  ) {
    return await this.authService.signUp(body, photo);
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
  async verifyOtp(@Body() body: VerifyOtpDto, @Req() req: APIRequest) {
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
  async resendOtp(@Req() req: APIRequest) {
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
  @Post('change-password')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Change password',
    description: 'Change user password',
  })
  @ApiBody({
    type: ChangePasswordDto,
    description: 'Change password data',
  })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async changePassword(
    @Body() body: ChangePasswordDto,
    @Req() req: APIRequest
  ) {
    return await this.authService.changePassword(body, req.user.id);
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
        message: { type: 'string', example: 'Profile fetched successfully' },
        data: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 1 },
                email: { type: 'string', example: 'john.doe@example.com' },
                first_name: { type: 'string', example: 'John' },
                last_name: { type: 'string', example: 'Doe' },
                role: { type: 'string', example: 'user' },
                is_verified: { type: 'boolean', example: true },
                phone: { type: 'string', example: '+1-555-123-4567' },
                created_at: { type: 'string', format: 'date-time' },
                updated_at: { type: 'string', format: 'date-time' },
                permissions: {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['permission1', 'permission2', 'permission3'],
                  description: 'Array of permission IDs for the user role',
                },
              },
            },
            child: {
              type: 'object',
              description: 'Child information if user has child role',
            },
          },
        },
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
  async getProfile(@Req() req: APIRequest) {
    return this.authService.getProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update-profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a user profile' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        first_name: { type: 'string', example: 'John' },
        last_name: { type: 'string', example: 'Doe' },
        phone: { type: 'string', example: '+1-555-123-4567' },
        photo_url: {
          type: 'string',
          format: 'binary',
          description: 'Profile photo (optional)',
        },
      },
    },
    description: 'Update user profile data',
  })
  @UseInterceptors(createImageUploadInterceptor('photo_url'))
  async updateProfile(
    @Req() req: APIRequest,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() photo_url?: Express.Multer.File
  ) {
    return this.authService.updateProfile(
      req.user.id,
      updateUserDto,
      photo_url
    );
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
      const result = await this.googleAuthService.authenticateWithGoogleIdToken(
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

  @Post('download-file')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Download file',
    description: 'Download file from file storage',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string', example: 'https://example.com/file.pdf' },
      },
      required: ['url'],
    },
    description: 'File URL',
  })
  @ApiResponse({
    status: 200,
    description: 'File downloaded successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'File downloaded successfully' },
        data: { type: 'string', example: 'File content' },
      },
    },
  })
  async downloadFile(@Body() body: { url: string }) {
    const file = await this.fileStorageService.downloadFile(body.url);
    return APIResponse.success({
      message: 'File downloaded successfully',
      data: file,
      statusCode: 200,
    });
  }
}
