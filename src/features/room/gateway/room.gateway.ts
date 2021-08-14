import {
  forwardRef,
  Inject,
  NotFoundException,
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

  handleDisconnect(socket: Socket) {
    this.roomService.leaveAllSocketRooms(socket);
  }

  @SubscribeMessage('room:subscribe')
  async subscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
  ) {
    const room = await this.roomService.getRoom(roomId);

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return this.roomService.subscribeSocket(client, room);
  }
}
