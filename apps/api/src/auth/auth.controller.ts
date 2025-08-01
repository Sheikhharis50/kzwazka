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
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    try {
      // User data from Google authentication
      const user = req.user;
      console.log('Google user data:', user);
      
      if (!user) {
        throw new UnauthorizedException('Google authentication failed');
      }
      // Generate JWT token
      const token = await this.authService.signIn(user);
      // Otherwise redirect to dashboard
      return res.redirect(`${frontendUrl}/dashboard?token=${token}`);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        // Redirect to login page with error message
        return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(error.message)}`);
      }
      
      // Handle other errors
      console.error('Google OAuth callback error:', error);
      return res.redirect(`${frontendUrl}/login?error=Authentication failed`);
    }
  }
}