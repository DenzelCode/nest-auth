import {
  forwardRef,
  Inject,
  UseGuards,
} from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { RoomService } from '../service/room.service';

@UseGuards(JwtAuthGuard)
@WebSocketGateway()
export class RoomGateway implements OnGatewayDisconnect<Socket> {
  @WebSocketServer() server: Server;

  constructor(
    @Inject(forwardRef(() => RoomService)) private roomService: RoomService,
  ) {}

  handleDisconnect(socket: Socket) {
    this.roomService.unsubscribeSocket(socket);
  }

  @SubscribeMessage('room:subscribe')
  async subscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
  ) {
    const room = await this.roomService.validateRoom(roomId);

    return this.roomService.subscribeSocket(client, room);
  }
}
