import { forwardRef, Inject, UseGuards } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { User } from '../schema/user.schema';
import { UserService } from '../service/user.service';

@UseGuards(JwtAuthGuard)
@WebSocketGateway()
export class UserGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    @Inject(forwardRef(() => UserService)) private userService: UserService,
  ) {}

  @SubscribeMessage('user:subscribe')
  subscribe(@ConnectedSocket() client: Socket, @CurrentUser() user: User) {
    return this.userService.subscribeSocket(client, user);
  }
}
