import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ParseObjectIdPipe } from '../../../shared/pipe/parse-object-id.pipe';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { User } from '../../user/schema/user.schema';
import { RoomDto } from '../dto/room.dto';
import { RoomService } from '../service/room.service';

@UseGuards(JwtAuthGuard)
@Controller('room')
export class RoomController {
  constructor(private roomService: RoomService) {}

  @Get()
  getUserRooms(@CurrentUser() user: User) {
    return this.roomService.getRoomsByOwner(user);
  }

  @Get('id/:id')
  get(@Param('id', ParseObjectIdPipe) id: string) {
    return this.roomService.getRoom(id);
  }

  @Get('public')
  getPublicRooms() {
    return this.roomService.getPublicRooms();
  }

  @Get('member')
  getRoomsByMember(@CurrentUser() user: User) {
    return this.roomService.getRoomsByMember(user);
  }

  @Delete('delete/:id')
  async delete(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.roomService.delete(
      await this.roomService.validateRoomByIdAndOwner(id, user),
      user,
    );
  }

  @Post()
  async create(@Body() room: RoomDto, @CurrentUser() user: User) {
    return this.roomService.create(room, user);
  }

  @Put(':id')
  async update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() body: RoomDto,
    @CurrentUser() user: User,
  ) {
    return this.roomService.update(
      await this.roomService.validateRoomByIdAndOwner(id, user),
      body,
      user,
    );
  }

  @Post('join')
  async join(
    @Body('roomId', ParseObjectIdPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.roomService.join(id, user);
  }

  @Delete('leave/:id')
  async leave(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.roomService.leave(
      user,
      await this.roomService.validateRoom(id),
    );
  }
}
