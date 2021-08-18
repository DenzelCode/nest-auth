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

  getMessage(id: string) {
    return this.messageModel
      .findById(id)
      .populate('from', '-password -sessionToken')
      .exec();
  }

  getPopulatedMessage(id: string) {
    return this.messageModel
      .findById(id)
      .populate('from', '-password -sessionToken')
      .populate('to', '-password -sessionToken')
      .populate('room')
      .exec();
  }

  getRoomMessages(room: Room) {
    return this.messageModel
      .where({ room: room._id })
      .populate('from', '-password -sessionToken')
      .find();
  }

  getDirectMessages(from: User, to: User) {
    return this.messageModel
      .where({
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
      .find();
  }

  async createRoomMessage(from: User, room: Room, message: string) {
    const object = await this.messageModel.create({
      from: from._id,
      room: room._id,
      message,
    });

    return object.populate('from', '-password -sessionToken').execPopulate();
  }

  async deleteRoomMessages(room: Room) {
    this.roomService.sendMessage(room, 'room:delete_messages', room);

    return this.messageModel.where({ room: room._id }).deleteMany();
  }

  async createDirectMessage(from: User, to: User, message: string) {
    const object = await this.messageModel.create({
      from: from._id,
      to: to._id,
      message,
    });

    return object.populate('from', '-password -sessionToken').execPopulate();
  }

  async deleteDirectMessage(message: Message) {
    this.userService.sendMessage(
      message.from,
      'direct:delete_message',
      message._id,
    );

    this.userService.sendMessage(
      message.to,
      'direct:delete_message',
      message._id,
    );

    return this.messageModel
      .where({ _id: message._id, to: message.to._id })
      .deleteOne();
  }

  async deleteRoomMessage(room: Room, messageId: string) {
    this.roomService.sendMessage(room, 'room:delete_message', messageId);

    return this.messageModel
      .where({ _id: messageId, room: room._id })
      .deleteOne();
  }

  async deleteDirectMessages(from: User, to: User) {
    this.userService.sendMessage(from, 'direct:delete_messages', to);
    this.userService.sendMessage(to, 'direct:delete_messages', from);

    return this.messageModel.where({ from: from._id, to: to._id }).deleteMany();
  }
}
