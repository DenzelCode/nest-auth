import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateQuery } from 'mongoose';
import { Socket } from 'socket.io';
import { getSocketClient } from '../../../shared/utils/get-socket-client';
import { remove } from '../../../shared/utils/remove';
import { MessageService } from '../../messages/service/message.service';
import { User } from '../../user/schema/user.schema';
import { UserService } from '../../user/service/user.service';
import { RoomDto } from '../dto/room.dto';
import { RoomGateway } from '../gateway/room.gateway';
import { Room } from '../schema/room.schema';

@Injectable()
export class RoomService {
  constructor(
    @InjectModel(Room.name) private roomModel: Model<Room>,
    private roomGateway: RoomGateway,
    private userService: UserService,
    @Inject(forwardRef(() => MessageService))
    private messageService: MessageService,
  ) {}

  async create(room: RoomDto, user: User) {
    const object = await this.roomModel.create({ ...room, owner: user._id });

    return object.populate('owner', '-password -sessionToken').execPopulate();
  }

  async update(room: Room, body: UpdateQuery<Room>, user: User) {
    this.handleUpdateRoom(room, body as Room);

    return this.roomModel
      .updateOne({ _id: room._id, owner: user._id }, body)
      .populate('owner', '-password -sessionToken');
  }

  handleUpdateRoom(room: Room, body: Partial<Room>) {
    this.sendMessage(room, 'room:update', Object.assign(room, body));
  }

  delete(room: Room, user: User) {
    this.handleDeleteRoom(room);

    return Promise.all([
      this.roomModel.findOneAndDelete({ _id: room._id, owner: user._id }),
      this.messageService.deleteRoomMessages(room),
    ]);
  }

  handleDeleteRoom(room: Room) {
    this.sendMessage(room, 'room:delete', room);
  }

  getRoomByIdAndOwner(roomId: string, owner: User) {
    return this.roomModel
      .findOne({ _id: roomId, owner: owner._id })
      .populate('members', '-password -sessionToken')
      .populate('owner', '-password -sessionToken');
  }

  async validateRoomByIdAndOwner(roomId: string, owner: User) {
    const room = await this.getRoomByIdAndOwner(roomId, owner);

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return room;
  }

  getRoom(roomId: string) {
    return this.roomModel
      .findById(roomId)
      .populate('members', '-password -sessionToken')
      .populate('owner', '-password -sessionToken');
  }

  async validateRoom(roomId: string) {
    const room = await this.getRoom(roomId);

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return room;
  }

  getRoomsByMember(user: User) {
    return this.roomModel
      .find({ members: { $in: user._id } })
      .populate('owner', '-password -sessionToken');
  }

  getPublicRooms() {
    return this.roomModel
      .find({ isPublic: true })
      .populate('owner', '-password -sessionToken');
  }

  getRoomsByOwner(user: User) {
    return this.roomModel.find({ owner: user._id });
  }

  getSockets(room: Room) {
    return this.roomGateway.server.in(`room_${room._id}`).allSockets();
  }

  subscribeSocket(socket: Socket, room: Room) {
    return socket.join(`room_${room._id}`);
  }

  unsubscribeSocket(socket: Socket) {
    const room = getSocketClient(socket).room;

    if (!room) {
      return;
    }

    return socket.leave(`room_${room._id}`);
  }

  sendMessage<T>(room: Room, event: string, message?: T) {
    return this.roomGateway.server.to(`room_${room._id}`).emit(event, message);
  }

  sendMessageExclude<T>(
    exclude: Socket,
    room: Room,
    event: string,
    message: T,
  ) {
    return exclude.broadcast.to(`room_${room._id}`).emit(event, message);
  }

  async join(roomId: string, user: User) {
    const room = await this.validateRoom(roomId);

    if (!room.members.find(member => user.id === member.id)) {
      room.members.push(user._id);

      this.handleJoinRoom(user, room);

      return room.save();
    }

    return room;
  }

  handleJoinRoom(user: User, room: Room) {
    this.sendMessage(room, 'room:join', this.userService.filterUser(user));
  }

  async leave(user: User, room: Room) {
    remove(room.members, member => member === user._id);

    this.handleLeaveRoom(user, room);

    return room.save();
  }

  handleLeaveRoom(user: User, room: Room) {
    this.sendMessage(room, 'room:leave', this.userService.filterUser(user));
  }
}
