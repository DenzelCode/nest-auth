import {
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ExceptionsFilter } from '../../../core/filter/exceptions.filter';
import { environments } from '../../../environments/environments';
import { ParseObjectIdPipe } from '../../../shared/pipe/parse-object-id.pipe';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { RoomService } from '../../room/service/room.service';
import { User } from '../../user/schema/user.schema';
import {
  NotificationType,
  SubscriptionService,
} from '../../user/service/subscription.service';
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
  ) {}

  @SubscribeMessage('message:direct')
  async sendDirectMessage(
    @MessageBody() body: DirectMessageDto,
    @CurrentUser() user: User,
  ) {
    const userTo = await this.userService.validateUserById(body.to);

    const message = await this.messageService.createDirectMessage(
      user,
      userTo,
      body.message,
    );

    this.userService.sendMessage(user, 'message:direct', message);
    this.userService.sendMessage(userTo, 'message:direct', message);

    if (userTo.id === user.id) {
      return true;
    }

    const url = environments.frontEndUrl;

    this.subscriptionService.sendNotification(userTo, {
      notification: {
        title: user.username,
        body: message.message,
      },
      mobileData: {
        type: NotificationType.Direct,
        routeName: '/direct-message',
        username: user.username,
      },
      webData: {
        onActionClick: {
          default: {
            operation: 'navigateLastFocusedOrOpen',
            url: `${url}/direct-message/${user.username}`,
          },
        },
      },
    });

    return true;
  }

  @SubscribeMessage('message:direct:typing')
  async sendDirectTyping(
    @MessageBody(new ParseObjectIdPipe()) userId: string,
    @CurrentUser() user: User,
  ) {
    return this.userService.sendMessage(
      await this.userService.validateUserById(userId),
      'message:direct:typing',
      { user: this.userService.filterUser(user) },
    );
  }

  @SubscribeMessage('message:room')
  async sendRoomMessage(
    @MessageBody() body: RoomMessageDto,
    @CurrentUser() user: User,
  ) {
    const room = await this.roomService.validateRoom(body.roomId);

    const message = await this.messageService.createRoomMessage(
      user,
      room,
      body.message,
    );

    const url = environments.frontEndUrl;

    for (const member of room.members) {
      if (member.id === user.id) {
        continue;
      }

      this.subscriptionService.sendNotification(member, {
        notification: {
          title: room.title,
          body: `${user.username}: ${message.message}`,
        },
        mobileData: {
          type: NotificationType.Room,
          routeName: '/rooms',
          roomId: room.id,
        },
        webData: {
          onActionClick: {
            default: {
              operation: 'navigateLastFocusedOrOpen',
              url: `${url}/room/${room._id}`,
            },
          },
        },
      });
    }

    return this.roomService.sendMessage(room, 'message:room', message);
  }

  @SubscribeMessage('message:room:typing')
  async sendRoomTyping(
    @MessageBody(new ParseObjectIdPipe()) roomId: string,
    @ConnectedSocket() socket: Socket,
    @CurrentUser() user: User,
  ) {
    const room = await this.roomService.validateRoom(roomId);

    return this.roomService.sendMessageExcept(
      socket,
      room,
      'message:room:typing',
      { room, user: this.userService.filterUser(user) },
    );
  }
}
