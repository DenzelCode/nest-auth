import { ArgumentsHost, ExecutionContext } from '@nestjs/common';

export const getRequest = <T>(ctx: ExecutionContext | ArgumentsHost): T => {
  switch (ctx.getType()) {
    case 'ws':
      return ctx.switchToWs().getClient<T>();
    case 'http':
      return ctx.switchToHttp().getRequest<T>();
    default:
      return undefined;
  }
};
