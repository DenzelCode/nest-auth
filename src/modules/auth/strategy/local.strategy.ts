import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../service/auth.service';

const STRATEGY_NAME = 'local';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, STRATEGY_NAME) {
  static strategyName = STRATEGY_NAME;

  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string) {
    return this.authService.validate(username, password);
  }
}
