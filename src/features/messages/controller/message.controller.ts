import {
  Controller,
  Get,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { RoomService } from '../../room/service/room.service';
import { User } from '../../user/schema/user.schema';
import { UserService } from '../../user/service/user.service';
import { MessageService } from '../service/message.service';

@UseGuards(JwtAuthGuard)
@Controller('message')
export class MessageController {
  constructor(
    private userService: UserService,
    private roomService: RoomService,
    private messageService: MessageService,
  ) {}

  @Get('room/:roomId')
  async getRoomMessages(@Param('roomId') roomId: string) {
    const room = await this.roomService.getRoom(roomId);

    if (!room) {
      throw new NotFoundException('User not found');
    }

    return this.messageService.getRoomMessages(room);
  }

  @Get('direct/:userId')
  async getDirectMessages(
    @CurrentUser() user: User,
    @Param('userId') to: string,
  ) {
    const userTo = await this.userService.getUserById(to);

    if (!userTo) {
      throw new NotFoundException('User not found');
    }

    return this.messageService.getDirectMessages(user, userTo);
  }
}
