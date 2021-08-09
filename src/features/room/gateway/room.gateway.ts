import { forwardRef, Inject, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Client } from '../../../shared/utils/get-client';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { RoomService } from '../service/room.service';

@UseGuards(JwtAuthGuard)
@WebSocketGateway()
export class RoomGateway implements OnGatewayDisconnect<Socket> {
  @WebSocketServer() server: Server;

  constructor(
    @Inject(forwardRef(() => RoomService)) private roomService: RoomService,
  ) {}

  handleDisconnect(client: Socket) {
    const user = ((client.handshake as unknown) as Client).user;

    if (!user) {
      return;
    }

    this.roomService.leave(user);
  }

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
