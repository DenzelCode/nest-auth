import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { GlobalConfig } from '../../../shared/types/global-config';
import { Client, getClient } from '../../../shared/utils/get-client';
import { UserService } from '../../user/service/user.service';
import { AuthService } from '../service/auth.service';

export interface Token {
  sub: string;
  username: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  reflector: Reflector;

  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
    private userService: UserService,
    private configService: ConfigService<GlobalConfig>,
  ) {
    this.reflector = new Reflector();
  }

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const client = this.getRequest(ctx);

    if (client.user && !this.configService.get('ACCESS_TOKEN_EXPIRATION')) {
      return true;
    }

    const allowAny = this.reflector.get<boolean>('allow-any', ctx.getHandler());

    try {
      client.user = await this.handleRequest(client);
    } catch (e) {
      if (allowAny) {
        return true;
      }

      throw e;
    }

    return client.user != null;
  }

  private async handleRequest(client: Client) {
    const token = this.getToken(client);

    const decoded = this.jwtService.decode(token) as Token;

    if (!decoded) {
      throw new UnauthorizedException('Unable to decode token');
    }

    try {
      const user = await this.validate(decoded);

      await this.jwtService.verifyAsync<Token>(
        token,
        this.authService.getAccessTokenOptions(user),
      );

      return user;
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private validate({ sub }: Token) {
    return this.userService.validateUser(sub);
  }

  private getToken(client: Client): string {
    const authorization = client.headers.authorization.split(' ');

    if (authorization[0].toLowerCase() !== 'bearer') {
      throw new UnauthorizedException('Authorization type not valid');
    }

    if (!authorization[1]) {
      throw new UnauthorizedException('Token not provided');
    }

    return authorization[1];
  }

  private getRequest(ctx: ExecutionContext) {
    return getClient(ctx);
  }
}
