import {
  forwardRef,
  Inject,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { RoomService } from '../service/room.service';

@UseGuards(JwtAuthGuard)
@WebSocketGateway()
export class RoomGateway {
  @WebSocketServer() server: Server;

  constructor(
    @Inject(forwardRef(() => RoomService)) private roomService: RoomService,
  ) {}

  @SubscribeMessage('room:subscribe')
  async subscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
  ) {
    const room = await this.roomService.getRoom(roomId);

    if (!room) {
      throw new WsException('Room not found');
    }

    return this.roomService.subscribeSocket(client, room);
  }
}
