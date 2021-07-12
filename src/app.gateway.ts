import { Logger, UseGuards } from '@nestjs/common';
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CurrentUser } from './modules/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from './modules/auth/guard/jwt-auth.guard';
import { User } from './modules/user/schema/user.schema';

@WebSocketGateway()
export class AppGateway
  implements OnGatewayConnection<Socket>, OnGatewayDisconnect<Socket> {
  logger = new Logger(this.constructor.name);

  @WebSocketServer() server: Server;

  online = 0;

  handleConnection(client: Socket, ...args: any[]) {
    this.online++;

    this.logger.log(`User ${client.id} connected; ${this.online}`);
  }

  handleDisconnect(client: Socket) {
    this.online--;

    this.logger.log(`User ${client.id} disconnected; ${this.online}`);
  }

  @SubscribeMessage('test')
  @UseGuards(JwtAuthGuard)
  handleTestMessage(@MessageBody() data: string, @CurrentUser() user: User) {
    this.logger.log(`Message received: ${data} from ${user.username}`);
  }
}
