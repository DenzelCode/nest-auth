import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Dictionary } from 'code-config/dist';
import { Request } from 'express';
import { ExtractJwt } from 'passport-jwt';
import { Strategy } from 'passport-jwt';
import { UserService } from '../../user/service/user.service';

export interface Token {
  sub: string;
  username: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private userService: UserService, private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET'),
      ignoreExpiration: !configService.get<string>('JWT_EXPIRATION'),
    });
  }

  async validate({ sub }: Token) {
    return this.userService.validateUser(sub);
  }

  async authenticate(request: Request, options: Dictionary) {
    if (request.user && !this.configService.get<string>('JWT_EXPIRATION')) {
      return this.success(request.user, request);
    }

    return super.authenticate(request, options);
  }
}
