import { UseGuards } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { User } from '../schema/user.schema';

@WebSocketGateway()
export class UserGateway {
  @WebSocketServer()
  server: Server;

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('test')
  handleTestMessage(@MessageBody() data: string, @CurrentUser() user: User) {
    console.log(`Message received: ${data} from ${user?.username}`);
  }
}
