import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { remove } from 'lodash';
import { Model, UpdateQuery } from 'mongoose';
import { User } from '../../user/schema/user.schema';
import { RoomDto } from '../dto/room.dto';
import { Room } from '../schema/room.schema';

@Injectable()
export class RoomService {
  constructor(@InjectModel(Room.name) private roomModel: Model<Room>) {}

  create(room: RoomDto, user: User) {
    return new this.roomModel({
      ...room,
      owner: user._id,
    }).save();
  }

  update(roomId: string, room: UpdateQuery<Room>, user: User) {
    return this.roomModel
      .updateOne({ _id: roomId, owner: user._id }, room)
      .exec();
  }

  delete(roomId: string, user: User) {
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

  async join(roomId: string, user: User) {
    const room = await this.getRoom(roomId);

    room.members.push(user._id);

    return room.save();
  }

  async leave(user: User) {
    const room = await this.getUserRoom(user);

    if (!room) {
      throw new BadRequestException('User does not have a room');
    }

    remove(room.members, member => member === user._id);

    return room.save();
  }
}
