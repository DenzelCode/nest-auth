import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppleLoginDto } from '../dto/apple-login.dto';
import { join } from 'path';
import { SECRETS_PATH } from '../../../common/constants/secrets';
import appleSignin from 'apple-signin-auth';
import { authConfig } from '../config/auth.config';

interface TokenResponse {
  email: string;
  sub: string;
  email_verified: boolean;
}

const auth = authConfig.apple;

const clientSecret = appleSignin.getClientSecret({
  clientID: auth.clientId,
  teamID: auth.teamId,
  privateKeyPath: join(SECRETS_PATH, 'apple-key.p8'),
  keyIdentifier: auth.keyIdentifier,
  expAfter: 15777000,
});

@Injectable()
export class AppleAuthService {
  constructor(private jwtService: JwtService) {}

  async getUser({ name, authorizationCode }: AppleLoginDto) {
    const options = {
      clientID: auth.clientId,
      redirectUri: '',
      clientSecret: clientSecret,
    };

    const response = await appleSignin.getAuthorizationToken(
      authorizationCode,
      options,
    );

    const accessToken = response.access_token;

    const json = this.jwtService.decode(accessToken) as TokenResponse;

    console.log(accessToken, json);

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
