import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { ChildrenService } from '../children/children.service';
import { GooglePayload } from './types/google';
import { generateToken } from 'src/utils/auth.utils';

@Injectable()
export class GoogleAuthService {
  private readonly oauth2Client: OAuth2Client;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly childrenService: ChildrenService
  ) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new Error('Google OAuth credentials not configured');
    }

    this.oauth2Client = new OAuth2Client(clientId, clientSecret, 'postmessage');
  }

  async authenticateWithGoogleIdToken(code: string) {
    const clientId = process.env.GOOGLE_CLIENT_ID!;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
    const oauth2 = new OAuth2Client(clientId, clientSecret, 'postmessage'); // << important for popup code exchange

    // 1) exchange code for tokens
    const { tokens } = await oauth2.getToken(code);
    if (!tokens?.id_token)
      throw new UnauthorizedException('No id_token from Google');

    // 2) verify ID token
    const ticket = await oauth2.verifyIdToken({
      idToken: tokens.id_token,
      audience: clientId,
    });
    const payload = ticket.getPayload() as GooglePayload;
    if (!payload?.sub) throw new UnauthorizedException('Invalid Google token');
    if (!payload.email || payload.email_verified === false) {
      throw new UnauthorizedException('Google email not verified');
    }

    const { sub, email, given_name, family_name, picture } = payload;

    // 3) find/link/create user (store googleId=sub)
    let user = await this.userService.findByEmail(email);

    if (!user) {
      const childRole = await this.userService.getRoleByName('children');
      if (!childRole)
        throw new Error('Child role not found. Please seed the database.');

      user = await this.userService.create({
        email,
        password: null,
        first_name: given_name || 'Unknown',
        last_name: family_name || 'Unknown',
        phone: '',
        role_id: childRole.id,
        is_active: true,
        google_social_id: sub,
        is_verified: true,
      });

      await this.childrenService.create({
        user_id: user.id,
        dob: new Date().toISOString(),
        photo_url: picture ?? '',
        parent_first_name: given_name || 'Unknown',
        parent_last_name: family_name || 'Unknown',
      });
    }

    // 4) issue your tokens
    const access_token = this.generateTokenForOAuthUser(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role_id || 'children',
        is_verified: user.is_verified,
      },
      access_token,
    };
  }

  generateTokenForOAuthUser(user: { id: number }) {
    return generateToken(this.jwtService, user.id);
  }
}
