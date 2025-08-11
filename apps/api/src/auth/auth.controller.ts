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
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/create-auth.dto';
import { LoginDto } from './dto/login-auth.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/password.dto';
import { VerifyOtpDto } from './dto/otp.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() body: SignUpDto) {
    return await this.authService.signUp(body);
  }
  @UseGuards(JwtAuthGuard)
  @Post('verify-otp')
  async verifyOtp(@Body() body: VerifyOtpDto, @Req() req: any) {
    return await this.authService.verifyOtp(req.user.id, body);
  }
  @UseGuards(JwtAuthGuard)
  @Post('resend-otp')
  async resendOtp(@Req() req: any) {
    return await this.authService.resendOtp(req.user.id);
  }

  @Post('login')
  async signIn(@Body() body: LoginDto) {
    return this.authService.signIn(body);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    return await this.authService.forgotPassword(body);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    return await this.authService.resetPassword(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req: any) {
    return this.authService.getProfile(req.user.id);
  }

  @Get('google/login')
  @UseGuards(GoogleOAuthGuard)
  googleLogin() {
    // Initiates Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  googleCallback(@Req() req: any, @Res() res: any) {
    try {
      if (!req.user) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'Authentication failed',
          error: 'No user data received from Google OAuth',
        });
      }

      // Generate JWT token for the authenticated user
      const token = this.authService.generateTokenForOAuthUser(req.user);

      // Return the token in the response body instead of setting a cookie
      return res.status(HttpStatus.OK).json({
        message: 'Login successful',
        access_token: token,
        user: {
          id: req.user.id,
          email: req.user.email,
          first_name: req.user.first_name,
          last_name: req.user.last_name,
          role: req.user.role,
          is_verified: req.user.is_verified,
        },
      });
    } catch (error) {
      // Handle specific error types
      if (error instanceof UnauthorizedException) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'Authentication failed',
          error: error.message,
        });
      }

      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error',
        error: 'An unexpected error occurred during authentication',
      });
    }
  }
}
