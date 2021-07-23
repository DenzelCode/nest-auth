import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppleLoginDto } from '../dto/apple-login.dto';
import { join } from 'path';
import { SECRETS_PATH } from '../../../common/constants/secrets';
import appleSignin, { AppleIdTokenType } from 'apple-signin-auth';
import { authConfig } from '../config/auth.config';

const auth = authConfig.apple;

const clientSecret = appleSignin.getClientSecret({
  clientID: auth.clientId,
  teamID: auth.teamId,
  privateKeyPath: join(SECRETS_PATH, 'apple-key.p8'),
  keyIdentifier: auth.keyIdentifier,
});

@Injectable()
export class AppleAuthService {
  async getUser({ name, authorizationCode }: AppleLoginDto) {
    try {
      const options = {
        clientID: auth.clientId,
        redirectUri: auth.redirectUri,
        clientSecret: clientSecret,
      };

      const response = await appleSignin.getAuthorizationToken(
        authorizationCode,
        options,
      );

      try {
        const json = await appleSignin.verifyIdToken(response.id_token, {
          audience: auth.clientId,
          ignoreExpiration: true,
        });

        return {
          name,
          id: json.sub,
          email: json.email,
        };
      } catch (e) {
        throw new UnauthorizedException('Invalid Apple token');
      }
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      }

      throw new UnauthorizedException(e.message || e);
    }
  }
}
