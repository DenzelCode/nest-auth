import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

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
}
