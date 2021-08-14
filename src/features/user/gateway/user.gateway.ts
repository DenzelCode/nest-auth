import { forwardRef, Inject, Logger, UseGuards } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  OnGatewayDisconnect,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { hostname } from 'os';
import { Server, Socket } from 'socket.io';
import { Client } from '../../../shared/utils/get-client';
import { getSocketUser } from '../../../shared/utils/get-socket-user';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { User } from '../schema/user.schema';
import { UserService } from '../service/user.service';

@UseGuards(JwtAuthGuard)
@WebSocketGateway()
export class UserGateway implements OnGatewayDisconnect, OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  logger = new Logger(this.constructor.name);

  online = 0;

  constructor(
    @Inject(forwardRef(() => UserService)) private userService: UserService,
  ) {}

  handleConnection(socket: Socket) {
    this.online++;
  }

  handleDisconnect(socket: Socket) {
    this.online--;

    const user = getSocketUser(socket);

    if (!user) {
      return;
    }

    this.logger.log(
      `User ${user.username} left the server ${hostname()}; ${this.online}`,
    );

    return this.userService.unsubscribeSocket(socket, user);
  }

  @SubscribeMessage('user:subscribe')
  async subscribe(
    @ConnectedSocket() client: Socket,
    @CurrentUser() user: User,
  ) {
    this.logger.log(
      `User ${user.username} joined the server ${hostname()}; ${this.online}`,
    );

    return this.userService.subscribeSocket(client, user);
  }
}
