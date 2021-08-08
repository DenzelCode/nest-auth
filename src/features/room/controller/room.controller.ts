/*
https://docs.nestjs.com/controllers#controllers
*/

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AppGateway } from '../../../app.gateway';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { User } from '../../user/schema/user.schema';
import { RoomDto } from '../dto/room.dto';
import { RoomService } from '../service/room.service';

@UseGuards(JwtAuthGuard)
@Controller('room')
export class RoomController {
  constructor(private roomService: RoomService) {}

  @Get(':id')
  get(@Param('id') roomId: string) {
    return this.roomService.getRoom(roomId);
  }

  @Delete(':id')
  delete(@Param('id') roomId: string, @CurrentUser() user: User) {
    return this.roomService.delete(roomId, user);
  }

  @Post()
  create(@Body() room: RoomDto, @CurrentUser() user: User) {
    return this.roomService.create(room, user);
  }

  @Post(':id')
  join(@Param('id') roomId: string, @CurrentUser() user: User) {
    return this.roomService.join(roomId, user);
  }

  @Delete()
  leave(@CurrentUser() user: User) {
    return this.roomService.leave(user);
  }
}
