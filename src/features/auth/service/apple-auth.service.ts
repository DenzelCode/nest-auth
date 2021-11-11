import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AppleLoginDto } from '../dto/apple-login.dto';
import { join } from 'path';
import appleSignin from 'apple-signin-auth';
import { authConfig } from '../config/auth.config';
import { SocialUser } from './auth.service';
import { existsSync, readFileSync } from 'fs';
import { PATHS } from '../../../shared/constants/paths';

@Injectable()
export class AppleAuthService {
  private privateKey: string;

  private privateKeyPath = join(PATHS.secrets, 'apple-key.p8');

  constructor() {
    if (existsSync(this.privateKeyPath)) {
      this.privateKey = readFileSync(this.privateKeyPath, 'utf-8');
    }
  }

  async getUser({
    name,
    authorizationCode,
    type,
  }: AppleLoginDto): Promise<SocialUser> {
    try {
      const clientId = authConfig.apple[type || 'ios'].clientId;

      const clientSecret = appleSignin.getClientSecret({
        clientID: clientId,
        privateKey: this.privateKey,
        teamID: authConfig.apple.teamId,
        keyIdentifier: authConfig.apple.keyIdentifier,
      });

      const response = await appleSignin.getAuthorizationToken(
        authorizationCode,
        {
          clientSecret,
          clientID: clientId,
          redirectUri: authConfig.apple[type].redirectUri,
        },
      );

      if (!response?.id_token) {
        throw new UnauthorizedException(
          `Access token cannot be retrieved from Apple: ${JSON.stringify(
            response,
          )}`,
        );
      }

      const json = await appleSignin.verifyIdToken(response.id_token, {
        audience: clientId,
        ignoreExpiration: true,
      });

      return {
        name,
        id: json.sub,
        email: json.email,
      };
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      }

      throw new UnauthorizedException(e.message || e);
    }
  }
}
