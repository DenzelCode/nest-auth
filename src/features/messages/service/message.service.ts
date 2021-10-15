import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
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
      .populate('from', this.userService.unpopulatedFields);
  }

  async validateMessage(id: string) {
    const message = await this.getMessage(id);

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    return message;
  }

  getPopulatedMessage(id: string) {
    return this.messageModel
      .findById(id)
      .populate('from', this.userService.unpopulatedFields)
      .populate('to', this.userService.unpopulatedFields)
      .populate('room');
  }

  async validatePopulatedMessage(id: string) {
    const message = await this.getPopulatedMessage(id);

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    return message;
  }

  getFirstRoomMessage(room: Room) {
    return this.messageModel
      .findOne({ room: room._id })
      .populate('from', this.userService.unpopulatedFields);
  }

  async getRoomMessages(room: Room, limit?: number, before?: Date) {
    const filter: FilterQuery<Room> = {
      room: room._id,
      createdAt: { $lte: before },
    };

    if (!before) {
      delete filter.createdAt;
    }

    return this.getMessages(filter, limit);
  }

  getDirectMessages(from: User, to: User, limit = 30, before?: Date) {
    const filter: FilterQuery<Room> = {
      ...this.getDirectMessageFilter(from, to),
      createdAt: { $lte: before },
    };

    if (!before) {
      delete filter.createdAt;
    }

    return this.getMessages(filter, limit);
  }

  private async getMessages(filter: FilterQuery<Message>, limit: number) {
    return this.sortMessages(
      await this.messageModel
        .find(filter)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate('from', this.userService.unpopulatedFields),
    );
  }

  sortMessages(messages: Message[]) {
    return messages.sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    );
  }

  getFirstDirectMessage(from: User, to: User) {
    return this.messageModel
      .findOne(this.getDirectMessageFilter(from, to))
      .populate('from', this.userService.unpopulatedFields);
  }

  private getDirectMessageFilter(from: User, to: User): FilterQuery<Message> {
    return {
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
    };
  }

  async createRoomMessage(from: User, room: Room, message: string) {
    const object = await this.messageModel.create({
      from: from._id,
      room: room._id,
      message,
    });

    return object
      .populate('from', this.userService.unpopulatedFields)
      .execPopulate();
  }

  async deleteRoomMessages(room: Room) {
    this.roomService.sendMessage(room, 'room:delete_messages', room.id);

    return this.messageModel.deleteMany({ room: room._id });
  }

  async createDirectMessage(from: User, to: User, message: string) {
    const object = await this.messageModel.create({
      from: from._id,
      to: to._id,
      message,
    });

    return object
      .populate('from', this.userService.unpopulatedFields)
      .execPopulate();
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

    return this.messageModel.findOneAndDelete({
      _id: message._id,
      to: message.to._id,
    });
  }

  async deleteRoomMessage(room: Room, messageId: string) {
    this.roomService.sendMessage(room, 'room:delete_message', messageId);

    return this.messageModel.findOneAndDelete({
      _id: messageId,
      room: room._id,
    });
  }

  async deleteDirectMessages(from: User, to: User) {
    this.userService.sendMessage(from, 'direct:delete_messages', to.id);
    this.userService.sendMessage(to, 'direct:delete_messages', from.id);

    return this.messageModel.findOneAndDelete({ from: from._id, to: to._id });
  }
}
