import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppleLoginDto } from '../dto/apple-login.dto';
import * as AppleAuth from 'apple-auth';
import { join } from 'path';
import { SECRETS_PATH } from '../../../common/constants/secrets';
import { ConfigService } from '@nestjs/config';
import { GlobalConfig } from '../../../common/types/global-config';

interface TokenResponse {
  email: string;
  sub: string;
  email_verified: boolean;
}

const path = join(SECRETS_PATH, 'apple-key.p8');

@Injectable()
export class AppleAuthService {
  private auth = new AppleAuth(
    {
      client_id: this.configService.get('APPLE_CLIENT_ID'),
      scope: 'name email',
      key_id: '',
      team_id: '',
      redirect_uri: '',
    },
    path,
    'file',
  );

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService<GlobalConfig>,
  ) {}

  async getUser({ name, authorizationCode }: AppleLoginDto) {
    console.log(name);
    const response = await this.auth.accessToken(authorizationCode);

    const accessToken = response.access_token;

    const json = this.jwtService.decode(accessToken) as TokenResponse;

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
