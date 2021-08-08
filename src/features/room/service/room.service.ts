import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateQuery } from 'mongoose';
import { Socket } from 'socket.io';
import { User } from '../../user/schema/user.schema';
import { RoomDto } from '../dto/room.dto';
import { RoomGateway } from '../gateway/room.gateway';
import { Room } from '../schema/room.schema';

@Injectable()
export class RoomService {
  constructor(
    @InjectModel(Room.name) private roomModel: Model<Room>,
    private roomGateway: RoomGateway,
  ) {}

  create(room: RoomDto, user: User) {
    return new this.roomModel({
      ...room,
      owner: user._id,
    }).save();
  }

  deleteUserRooms(user: User) {
    return this.roomModel.deleteMany({ owner: user._id }).exec();
  }

  update(roomId: string, room: UpdateQuery<Room>, user: User) {
    return this.roomModel
      .updateOne({ _id: roomId, owner: user._id }, room)
      .exec();
  }

  delete(roomId: string, user: User) {
    this.roomGateway.server.in(roomId).emit('');

    return this.roomModel.deleteOne({ _id: roomId, owner: user._id }).exec();
  }

  getRoom(roomId: string) {
    return this.roomModel.findOne({ _id: roomId }).exec();
  }

  getUserRoom(user: User) {
    return this.roomModel
      .findOne({
        members: {
          $in: user._id,
        },
      })
      .exec();
  }

  subscribeSocket(socket: Socket, room: Room) {
    return socket.join(`room_${room._id}`);
  }

  sendMessage<T>(room: Room, event: string, message: T) {
    this.roomGateway.server.in(`room_${room._id}`).emit(event, message);
  }

  async join(roomId: string, user: User) {
    const room = await this.getRoom(roomId);

    if (!room.members.includes(user._id)) {
      room.members.push(user._id);

      return room.save();
    }

    return room;
  }

  async leave(user: User) {
    const room = await this.getUserRoom(user);

    if (!room) {
      throw new BadRequestException('User does not have a room');
    }

    const index = room.members.findIndex(member => member === user._id);
    room.members.splice(index, 1);

    return room.save();
  }
}
