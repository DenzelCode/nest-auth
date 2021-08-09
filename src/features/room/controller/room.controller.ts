import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { User } from '../../user/schema/user.schema';
import { RoomIdDto } from '../dto/room-id.dto';
import { RoomDto } from '../dto/room.dto';
import { RoomService } from '../service/room.service';

@UseGuards(JwtAuthGuard)
@Controller('room')
export class RoomController {
  constructor(private roomService: RoomService) {}

  @Get('id/:roomId')
  get(@Param() body: RoomIdDto) {
    return this.roomService.getRoom(body.roomId);
  }

  @Get()
  getUserRooms(@CurrentUser() user: User) {
    return this.roomService.getUserRooms(user);
  }

  @Get('public')
  getPublicRooms() {
    return this.roomService.getPublicRooms();
  }

  @Delete(':id')
  delete(@Param('id') roomId: string, @CurrentUser() user: User) {
    return this.roomService.delete(roomId, user);
  }

  @Post()
  async create(@Body() room: RoomDto, @CurrentUser() user: User) {
    return this.roomService.create(room, user);
  }

  @Put(':roomId')
  async update(
    @Param() params: RoomIdDto,
    @Body() room: RoomDto,
    @CurrentUser() user: User,
  ) {
    return this.roomService.update(params.roomId, room, user);
  }

  @Post('join')
  join(@Body() body: RoomIdDto, @CurrentUser() user: User) {
    const room = this.roomService.join(body.roomId, user);

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return room;
  }

  @Delete()
  async leave(@CurrentUser() user: User) {
    const room = await this.roomService.leave(user);

    if (!room) {
      throw new NotFoundException('User does not have a room');
    }

    return room;
  }
}
