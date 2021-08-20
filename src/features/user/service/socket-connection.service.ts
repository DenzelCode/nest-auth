import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { hostname } from 'os';
import { Socket } from 'socket.io';
import { environments } from '../../../environments/environments';
import { SocketConnection } from '../schema/socket-connection.schema';
import { User } from '../schema/user.schema';
import { UserService } from './user.service';

@Injectable()
export class SocketConnectionService {
  constructor(
    @InjectModel(SocketConnection.name)
    private socketConnectionModel: Model<SocketConnection>,
    @Inject(forwardRef(() => UserService)) private userService: UserService,
  ) {}

  async create(socket: Socket, user: User) {
    const connection = await this.socketConnectionModel.create({
      user: user._id,
      socketId: socket.id,
      serverHostname: hostname(),
      serverPort: environments.port,
    });

    if (!user.online) {
      user.online = true;

      await user.save();
    }

    return connection.populate('user').execPopulate();
  }

  getAll(user: User) {
    return this.socketConnectionModel.find({ user: user._id });
  }

  getById(id: string) {
    return this.socketConnectionModel.findById(id).populate('user');
  }

  getBySocket(socket: Socket) {
    return this.socketConnectionModel
      .findOne({ socketId: socket.id })
      .populate('user');
  }

  async deleteAllConnections() {
    await this.socketConnectionModel.deleteMany({
      serverHostname: hostname(),
      serverPort: environments.port,
    });

    const users = await this.userService.getOnlineUsers();

    for (const user of users) {
      const connections = await this.getAll(user);

      if (connections.length === 0) {
        user.online = false;

        await user.save();
      }
    }
  }

  async delete(socket: Socket) {
    const connection = await this.getBySocket(socket);

    if (!connection) {
      return;
    }

    await this.socketConnectionModel.findByIdAndDelete(connection._id);

    const user = connection.user;

    const connections = await this.getAll(user);

    if (connections.length === 0) {
      user.online = false;

      await user.save();
    }

    return connection;
  }
}
