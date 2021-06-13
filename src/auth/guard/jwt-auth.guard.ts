import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/user/schema/user.schema';

export class JwtAuthGuard extends AuthGuard('jwt') {
  reflector: Reflector;

  constructor() {
    super();

    this.reflector = new Reflector();
  }

  getRequest(ctx: ExecutionContext) {
    switch (ctx.getType()) {
      case 'ws':
        return ctx.switchToWs().getClient().handshake;
      default:
        return ctx.switchToHttp().getRequest();
    }
  }

  handleRequest(err: Error, user: User, info: string, ctx: ExecutionContext, status: number) {
    const allowAny = this.reflector.get<boolean>('allow-any', ctx.getHandler());

    if (allowAny) {
      return this.getRequest(ctx).user;
    }

    return super.handleRequest(err, user, info, ctx, status);
  }
}
