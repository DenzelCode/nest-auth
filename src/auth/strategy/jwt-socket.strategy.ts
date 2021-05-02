import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';
import { Strategy } from 'passport-jwt';
import { UserService } from '../../user/service/user.service';
import { Token } from './jwt.strategy';

@Injectable()
export class JwtSocketStrategy extends PassportStrategy(
  Strategy,
  'jwt-socket',
) {
  constructor(private userService: UserService, configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromUrlQueryParameter('token'),
      secretOrKey: configService.get<string>('JWT_SECRET'),
      ignoreExpiration: false,
    });
  }

  validate({ sub }: Token) {
    return this.userService.validateUser(sub);
  }
}
