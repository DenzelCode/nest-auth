import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
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
    @Inject(forwardRef(() => UserService)) private userService: UserService,
  ) {
    this.reflector = new Reflector();
  }

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const client = this.getRequest(ctx);

    const allowAny = this.reflector.get<boolean>('allow-any', ctx.getHandler());

    try {
      client.user = await this.handleRequest(ctx, client);
    } catch (e) {
      if (allowAny) {
        return true;
      }

      throw e;
    }

    return client.user != null;
  }

  getSocketUser(ctx: ExecutionContext, client: Client, decoded: Token) {
    const user = client.user;

    if (!user || ctx.getType() !== 'ws') {
      return undefined;
    }

    return user;
  }

  private async handleRequest(ctx: ExecutionContext, client: Client) {
    const token = this.getToken(ctx, client);

    const decoded = this.jwtService.decode(token) as Token;

    if (!decoded) {
      this.throwException(ctx, 'Unable to decode token');
    }

    const socketUser = this.getSocketUser(ctx, client, decoded);

    try {
      const user = socketUser || (await this.validate(decoded));

      await this.jwtService.verifyAsync<Token>(
        token,
        this.authService.getAccessTokenOptions(user),
      );

      return user;
    } catch (e) {
      this.throwException(ctx, 'Invalid token');
    }
  }

  private validate({ sub }: Token) {
    return this.userService.validateUser(sub);
  }

  private getToken(ctx: ExecutionContext, client: Client): string {
    const authorization = client.headers.authorization?.split(' ');

    if (!authorization) {
      this.throwException(ctx, 'Token not found');
    }

    if (authorization[0].toLowerCase() !== 'bearer') {
      this.throwException(ctx, 'Authorization type not valid');
    }

    if (!authorization[1]) {
      this.throwException(ctx, 'Token not provided');
    }

    return authorization[1];
  }

  throwException(ctx: ExecutionContext, message: string) {
    if (ctx.getType() === 'ws') {
      ctx
        .switchToWs()
        .getClient<Socket>()
        .disconnect(true);
    }

    throw new UnauthorizedException(message);
  }

  private getRequest(ctx: ExecutionContext) {
    return getClient(ctx);
  }
}
