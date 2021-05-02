import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export class JwtSocketAuthGuard extends AuthGuard('jwt-socket') {
  getRequest(context: ExecutionContext) {
    return context.switchToWs().getClient();
  }
}
