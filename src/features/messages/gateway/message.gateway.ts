import { UseGuards } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { RoomService } from '../../room/service/room.service';
import { User } from '../../user/schema/user.schema';
import { UserService } from '../../user/service/user.service';
import { DirectMessageDto } from '../dto/direct-message.dto';
import { RoomMessageDto } from '../dto/room-message.dto';
import { MessageService } from '../service/message.service';

@UseGuards(JwtAuthGuard)
@WebSocketGateway()
export class MessageGateway {
  @WebSocketServer() server: Server;

  constructor(
    private userService: UserService,
    private roomService: RoomService,
    private messageService: MessageService,
  ) {}

  @SubscribeMessage('message:direct')
  async sendDirectMessage(
    @MessageBody() body: DirectMessageDto,
    @CurrentUser() user: User,
  ) {
    const userTo = await this.userService.getUserById(body.to);

    if (!userTo) {
      throw new WsException('User not found');
    }

    this.messageService.createDirectMessage(user, userTo, body.message);

    this.userService.sendMessage(userTo, 'message:direct', body.message);
  }

  @SubscribeMessage('message:room')
  async sendRoomMessage(
    @MessageBody() body: RoomMessageDto,
    @CurrentUser() user: User,
  ) {
    const room = await this.roomService.getRoom(body.roomId);

    if (!room) {
      throw new WsException('Room not found');
    }

    this.messageService.createRoomMessage(user, room, body.message);

    this.roomService.sendMessage(room, 'message:room', body.message);
  }
}
