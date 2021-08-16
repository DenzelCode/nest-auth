import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { RoomService } from '../../room/service/room.service';
import { User } from '../../user/schema/user.schema';
import { UserService } from '../../user/service/user.service';
import { DeleteDirectMessageDto } from '../dto/delete-direct-message.dto';
import { DeleteRoomMessageDto } from '../dto/delete-room-message.dto';
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

  @Delete('room')
  async deleteRoomMessage(
    @Body() body: DeleteRoomMessageDto,
    @CurrentUser() user: User,
  ) {
    const room = await this.roomService.getRoom(body.roomId);

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const message = await this.messageService.getMessage(body.messageId);

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (room.owner.id !== user.id && message.from.id !== user.id) {
      throw new UnauthorizedException('You are not the message owner');
    }

    return this.messageService.deleteRoomMessage(room, body.messageId);
  }

  @Delete('room/all')
  async deleteRoomMessages(
    @Body() body: DeleteRoomMessageDto,
    @CurrentUser() user: User,
  ) {
    const room = await this.roomService.getRoom(body.roomId);

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (user.id !== room.owner.id) {
      throw new UnauthorizedException('You are not the room owner');
    }

    return this.messageService.deleteRoomMessages(room);
  }

  @Delete('direct')
  async deleteDirectMessage(
    @Body() body: DeleteDirectMessageDto,
    @CurrentUser() from: User,
  ) {
    const to = await this.userService.getUserById(body.to);

    if (!to) {
      throw new NotFoundException('User not found');
    }

    return this.messageService.deleteDirectMessage(from, to, body.messageId);
  }

  @Delete('direct/all')
  async deleteDirectMessages(
    @Body() body: DeleteDirectMessageDto,
    @CurrentUser() from: User,
  ) {
    const to = await this.userService.getUserById(body.to);

    if (!to) {
      throw new NotFoundException('User not found');
    }

    return this.messageService.deleteDirectMessages(from, to);
  }
}
