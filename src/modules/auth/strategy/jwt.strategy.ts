import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Dictionary } from 'code-config/dist';
import { Request } from 'express';
import { ExtractJwt } from 'passport-jwt';
import { Strategy } from 'passport-jwt';
import { GlobalConfig } from 'src/common/types/global-config';
import { UserService } from '../../user/service/user.service';

export interface Token {
  sub: string;
  username: string;
}

const STRATEGY_NAME = 'jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, STRATEGY_NAME) {
  static strategyName = STRATEGY_NAME;

  constructor(
    private userService: UserService,
    private configService: ConfigService<GlobalConfig>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('ACCESS_TOKEN_SECRET'),
      ignoreExpiration: !configService.get('ACCESS_TOKEN_EXPIRATION'),
    });
  }

  async validate({ sub }: Token) {
    return this.userService.validateUser(sub);
  }

  async authenticate(request: Request, options: Dictionary) {
    if (request.user && !this.configService.get('ACCESS_TOKEN_EXPIRATION')) {
      return this.success(request.user, request);
    }

    return super.authenticate(request, options);
  }
}
