import {
  forwardRef,
  Inject,
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
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
import { ExceptionsFilter } from '../../../core/filter/exceptions.filter';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { RoomService } from '../service/room.service';

@UsePipes(new ValidationPipe())
@UseFilters(new ExceptionsFilter())
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
    return this.roomService.subscribeSocket(
      client,
      await this.roomService.validateRoom(roomId),
    );
  }
}
