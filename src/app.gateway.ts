import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { hostname } from 'os';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class AppGateway
  implements OnGatewayConnection<Socket>, OnGatewayDisconnect<Socket> {
  logger = new Logger(this.constructor.name);

  @WebSocketServer() server: Server;

  online = 0;

  handleConnection(client: Socket) {
    this.online++;

    this.logger.log(
      `User ${client.id}:${client.handshake.address} connected; ${
        this.online
      }; ${hostname()}`,
    );
  }

  handleDisconnect(client: Socket) {
    this.online--;

    this.logger.log(
      `User ${client.id}:${client.handshake.address} disconnected; ${
        this.online
      }; ${hostname()}`,
    );
  }
}
