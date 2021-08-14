import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Room } from '../../room/schema/room.schema';
import { RoomService } from '../../room/service/room.service';
import { User } from '../../user/schema/user.schema';
import { UserService } from '../../user/service/user.service';
import { Message } from '../schema/message.schema';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
    @Inject(forwardRef(() => RoomService)) private roomService: RoomService,
    private userService: UserService,
  ) {}

  getRoomMessages(room: Room) {
    return this.messageModel
      .find({ room: room._id })
      .populate('from', '-password -sessionToken')
      .exec();
  }

  getDirectMessages(from: User, to: User) {
    return this.messageModel
      .find({
        $or: [
          {
            from: from._id,
            to: to._id,
          },
          {
            to: from._id,
            from: to._id,
          },
        ],
      })
      .populate('from', '-password -sessionToken')
      .exec();
  }

  async createRoomMessage(from: User, room: Room, message: string) {
    const object = await new this.messageModel({
      from: from._id,
      room: room._id,
      message,
    }).save();

    return object.populate('from', '-password -sessionToken').execPopulate();
  }

  async deleteRoomMessages(room: Room) {
    this.roomService.sendMessage(room, 'room:delete_messages', room);

    return this.messageModel
      .deleteMany({
        room: room._id,
      })
      .exec();
  }

  async createDirectMessage(from: User, to: User, message: string) {
    const object = await new this.messageModel({
      from: from._id,
      to: to._id,
      message,
    }).save();

    return object.populate('from', '-password -sessionToken').execPopulate();
  }

  async deleteDirectMessage(from: User, to: User, messageId: string) {
    this.userService.sendMessage(from, 'direct:delete_message', messageId);
    this.userService.sendMessage(to, 'direct:delete_message', messageId);

    return this.messageModel
      .deleteOne({
        _id: messageId,
        from: from._id,
        to: to._id,
      })
      .exec();
  }

  async deleteRoomMessage(from: User, room: Room, messageId: string) {
    this.roomService.sendMessage(room, 'room:delete_message', messageId);

    return this.messageModel
      .deleteOne({
        _id: messageId,
        room: room._id,
        from: from._id,
      })
      .exec();
  }

  async deleteDirectMessages(from: User, to: User) {
    this.userService.sendMessage(from, 'direct:delete_messages');
    this.userService.sendMessage(to, 'direct:delete_messages');

    return this.messageModel
      .deleteMany({
        from: from._id,
        to: to._id,
      })
      .exec();
  }
}
