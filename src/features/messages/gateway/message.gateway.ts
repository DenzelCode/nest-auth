import {
  NotFoundException,
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ExceptionsFilter } from '../../../core/filter/exceptions.filter';
import { GlobalConfig } from '../../../shared/types/global-config';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { RoomService } from '../../room/service/room.service';
import { User } from '../../user/schema/user.schema';
import { SubscriptionService } from '../../user/service/subscription.service';
import { UserService } from '../../user/service/user.service';
import { DirectMessageDto } from '../dto/direct-message.dto';
import { RoomMessageDto } from '../dto/room-message.dto';
import { MessageService } from '../service/message.service';

@UsePipes(new ValidationPipe())
@UseFilters(new ExceptionsFilter())
@UseGuards(JwtAuthGuard)
@WebSocketGateway()
export class MessageGateway {
  @WebSocketServer() server: Server;

  constructor(
    private userService: UserService,
    private roomService: RoomService,
    private messageService: MessageService,
    private subscriptionService: SubscriptionService,
    private configService: ConfigService<GlobalConfig>,
  ) {}

  @SubscribeMessage('message:direct')
  async sendDirectMessage(
    @MessageBody() body: DirectMessageDto,
    @CurrentUser() user: User,
  ) {
    const userTo = await this.userService.getUserById(body.to);

    if (!userTo) {
      throw new NotFoundException('User not found');
    }

    const message = await this.messageService.createDirectMessage(
      user,
      userTo,
      body.message,
    );

    this.userService.sendMessage(user, 'message:direct', message);
    this.userService.sendMessage(userTo, 'message:direct', message);

    const url = this.configService.get('FRONTEND_URL');

    this.subscriptionService.sendNotification(userTo, {
      title: user.username,
      body: message.message,
      data: {
        url: `${url}/direct-message/${user.username}`,
      },
    });

    return true;
  }

  @SubscribeMessage('message:room')
  async sendRoomMessage(
    @MessageBody() body: RoomMessageDto,
    @CurrentUser() user: User,
  ) {
    const room = await this.roomService.getRoom(body.roomId);

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const message = await this.messageService.createRoomMessage(
      user,
      room,
      body.message,
    );

    return this.roomService.sendMessage(room, 'message:room', message);
  }
}
