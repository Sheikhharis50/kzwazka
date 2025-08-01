import { Controller, Post, Body, Get, UseGuards, Request, HttpException, HttpStatus, Req, Res, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/create-auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() signUpDto: SignUpDto) {
    try {
      console.log('Received signup data:', signUpDto); // Debug log
      console.log('Body type:', typeof signUpDto);
      console.log('Body keys:', Object.keys(signUpDto || {}));
      
      if (!signUpDto || Object.keys(signUpDto).length === 0) {
        throw new HttpException('Request body is empty', HttpStatus.BAD_REQUEST);
      }
      
      return await this.authService.signUp(signUpDto);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  @Post('signin')
  async signIn(@Body() signInDto: { email: string; password: string }) {
    return this.authService.signIn(signInDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('children')
  async getChildren(@Request() req) {
    return this.authService.getChildren(req.user.sub);
  }

  @Get('google/login')
  @UseGuards(GoogleOAuthGuard)
  googleLogin() {
    // Initiates Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  async googleCallback(@Req() req, @Res() res) {
    try {
      if (!req.user) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'Authentication failed',
          error: 'No user data received from Google OAuth'
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
        }
      });
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      
      // Handle specific error types
      if (error instanceof UnauthorizedException) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'Authentication failed',
          error: error.message
        });
      }
      
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error',
        error: 'An unexpected error occurred during authentication'
      });
    }
  }
}