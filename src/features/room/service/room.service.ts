import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateQuery } from 'mongoose';
import { Socket } from 'socket.io';
import { remove } from '../../../shared/utils/remove';
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
    })
      .populate('owner', '-password -sessionToken')
      .save();
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
    return this.roomModel
      .findOne({ _id: roomId })
      .populate('members', '-password -sessionToken')
      .populate('owner', '-password -sessionToken')
      .exec();
  }

  getUserRoom(user: User) {
    const filter = {
      members: {
        $in: user._id,
      },
    };

    return this.roomModel.findOne(filter).exec();
  }

  getPublicRooms() {
    return this.roomModel
      .find({ isPublic: true })
      .populate('owner', '-password -sessionToken')
      .exec();
  }

  getUserRooms(user: User) {
    return this.roomModel.find({ owner: user._id }).exec();
  }

  subscribeSocket(socket: Socket, room: Room) {
    return socket.join(`room_${room._id}`);
  }

  sendMessage<T>(room: Room, event: string, message: T) {
    this.roomGateway.server.to(`room_${room._id}`).emit(event, message);
  }

  async join(roomId: string, user: User) {
    const room = await this.getRoom(roomId);

    if (!room) {
      return undefined;
    }

    if (!room.members.includes(user._id)) {
      room.members.push(user._id);

      return room.save();
    }

    return room;
  }

  async leave(user: User) {
    const room = await this.getUserRoom(user);

    if (!room) {
      return undefined;
    }

    remove(room.members, member => member === user._id);

    return room.save();
  }
}
