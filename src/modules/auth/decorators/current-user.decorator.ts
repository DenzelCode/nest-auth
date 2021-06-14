import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  switch (ctx.getType()) {
    case 'http':
      return ctx.switchToHttp().getRequest().user;
    case 'ws':
      return ctx.switchToWs().getClient().handshake.user;
    default:
      return undefined;
  }
});
