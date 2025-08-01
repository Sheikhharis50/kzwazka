import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    const clientID = configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');
    const callbackURL = configService.get<string>('GOOGLE_CALLBACK_URL') || 'http://localhost:8000/api/auth/google/callback';

    if (!clientID || !clientSecret) {
      throw new Error('Google OAuth credentials are not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.');
    }

    console.log('Google OAuth Config:', { clientID, clientSecret, callbackURL });
    
    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      const { name, emails, photos, id } = profile;
      
      // Validate required fields
      if (!emails || emails.length === 0) {
        return done(new Error('Email is required for authentication'), null);
      }

      if (!name || !name.givenName || !name.familyName) {
        return done(new Error('Name information is required for authentication'), null);
      }

      const user = {
        email: emails[0].value,
        firstName: name.givenName,
        lastName: name.familyName,
        picture: photos && photos.length > 0 ? photos[0].value : null,
        accessToken,
        id: id,
      };
      
      console.log('Google OAuth User:', user);

      const authenticatedUser = await this.authService.validateChildOAuthLogin(user, 'google');
      
      done(null, authenticatedUser);
    } catch (error) {
      console.error('Google OAuth validation error:', error);
      done(error, null);
    }
  }
}