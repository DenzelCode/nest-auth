import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateQuery } from 'mongoose';
import { Socket } from 'socket.io';
import { getSocketUser } from '../../../shared/utils/get-socket-user';
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
    const object = await new this.roomModel({
      ...room,
      owner: user._id,
    }).save();

    return object.populate('owner', '-password -sessionToken').execPopulate();
  }

  async update(room: Room, body: UpdateQuery<Room>, user: User) {
    this.handleUpdateRoom(room, body as Room);

    return this.roomModel
      .updateOne({ _id: room._id, owner: user._id }, body)
      .exec();
  }

  handleUpdateRoom(room: Room, body: Partial<Room>) {
    this.sendMessage(room, 'room:update', Object.assign(room, body));
  }

  delete(room: Room, user: User) {
    this.handleDeleteRoom(room);

    return Promise.all([
      this.roomModel.deleteOne({ _id: room._id, owner: user._id }).exec(),
      this.messageService.deleteRoomMessages(room),
    ]);
  }

  handleDeleteRoom(room: Room) {
    this.sendMessage(room, 'room:delete', room);
  }

  getRoomWithOwner(roomId: string, owner: User) {
    return this.roomModel
      .findOne({ _id: roomId, owner: owner._id })
      .populate('members', '-password -sessionToken')
      .populate('owner', '-password -sessionToken')
      .exec();
  }

  getRoom(roomId: string) {
    return this.roomModel
      .findOne({ _id: roomId })
      .populate('members', '-password -sessionToken')
      .populate('owner', '-password -sessionToken')
      .exec();
  }

  getUserCurrentRooms(user: User) {
    const filter = {
      members: {
        $in: user._id,
      },
    };

    return this.roomModel.find(filter).exec();
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

  getSockets(room: Room) {
    return this.roomGateway.server.in(`room_${room._id}`).allSockets();
  }

  async hasUserSockets(room: Room, user: User) {
    const clients = await this.getSockets(room);

    return user.sockets.some(socket => clients.has(socket));
  }

  async hasSocket(room: Room, socket: Socket) {
    const clients = await this.getSockets(room);

    return clients.has(socket.id);
  }

  subscribeSocket(socket: Socket, room: Room) {
    return socket.join(`room_${room._id}`);
  }

  unsubscribeSocket(socket: Socket, room: Room) {
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
    const room = await this.getRoom(roomId);

    if (!room) {
      return undefined;
    }

    if (room.members.findIndex(member => user.id === member.id) === -1) {
      room.members.push(user._id);

      this.handleJoinRoom(user, room);

      return room.save();
    }

    return room;
  }

  handleJoinRoom(user: User, room: Room) {
    this.sendMessage(room, 'room:join', this.userService.filterUser(user));
  }

  async leave(socket: Socket, room: Room) {
    const user = getSocketUser(socket);

    if (!user) {
      return;
    }

    await this.unsubscribeSocket(socket, room);

    if (!(await this.hasUserSockets(room, user))) {
      remove(room.members, member => member === user._id);

      this.handleLeaveRoom(user, room);

      room.save();
    }
  }

  async getSocketRooms(socket: Socket) {
    const user = getSocketUser(socket);

    if (!user) {
      return undefined;
    }

    const rooms = await this.getUserCurrentRooms(user);

    return rooms.filter(room => this.hasSocket(room, socket));
  }

  async leaveAllSocketRooms(socket: Socket) {
    const rooms = await this.getSocketRooms(socket);

    rooms.forEach(room => this.leave(socket, room));
  }

  handleLeaveRoom(user: User, room: Room) {
    this.sendMessage(room, 'room:leave', this.userService.filterUser(user));
  }
}
