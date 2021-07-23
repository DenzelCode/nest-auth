import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppleLoginDto } from '../dto/apple-login.dto';
import { join } from 'path';
import { SECRETS_PATH } from '../../../common/constants/secrets';
import { GlobalConfig } from '../../../common/types/global-config';
import appleSignin from 'apple-signin-auth';
import { config } from 'dotenv';

config();

interface TokenResponse {
  email: string;
  sub: string;
  email_verified: boolean;
}

const env = (process.env as unknown) as GlobalConfig;

const clientSecret = appleSignin.getClientSecret({
  clientID: env.APPLE_CLIENT_ID,
  teamID: env.APPLE_TEAM_ID,
  privateKeyPath: join(SECRETS_PATH, 'apple-key.p8'),
  keyIdentifier: env.APPLE_KEY_IDENTIFIER,
  expAfter: 15777000,
});

@Injectable()
export class AppleAuthService {
  constructor(private jwtService: JwtService) {}

  async getUser({ name, authorizationCode }: AppleLoginDto) {
    const options = {
      clientID: env.APPLE_CLIENT_ID,
      redirectUri: '',
      clientSecret: clientSecret,
    };

    const response = await appleSignin.getAuthorizationToken(
      authorizationCode,
      options,
    );

    const accessToken = response.access_token;

    const json = this.jwtService.decode(accessToken) as TokenResponse;

    console.log(json);

    if (json == null) {
      throw new UnauthorizedException('Invalid Apple token');
    }

    return {
      name,
      id: json.sub,
      email: json.email,
    };
  }
}
