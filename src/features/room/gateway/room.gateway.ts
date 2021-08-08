import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class RoomGateway {
  @WebSocketServer() server: Server;

  @SubscribeMessage('events')
  handleEvent(@MessageBody() data: string) {
    return `hello ${data}`;
  }
}
