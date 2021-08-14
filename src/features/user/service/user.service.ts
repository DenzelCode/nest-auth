import {
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { ObjectId } from 'mongodb';
import { User } from '../schema/user.schema';
import { randomString } from '../../../shared/utils/random-string';
import { UserGateway } from '../gateway/user.gateway';
import { Socket } from 'socket.io';

@Injectable()
export class UserService {
  private filteredFields: (keyof User)[] = ['password', 'sessionToken'];

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @Inject(forwardRef(() => UserGateway)) private userGateway: UserGateway,
  ) {}

  getUserByName(name: string) {
    const username = { $regex: new RegExp(`^${name}$`, 'i') };

    return this.userModel.findOne({ username }).exec();
  }

  getUserByEmail(mail: string) {
    const email = { $regex: new RegExp(`^${mail}$`, 'i') };

    return this.userModel.findOne({ email }).exec();
  }

  getUserBy(filter: FilterQuery<User>) {
    return this.userModel.findOne(filter).exec();
  }

  getUserByGoogleId(id: string) {
    return this.userModel.findOne({ googleId: id }).exec();
  }

  getUserById(id: ObjectId | string) {
    return this.userModel.findById(id).exec();
  }

  async subscribeSocket(socket: Socket, user: User) {
    await this.addUserSocket(user, socket);

    return socket.join(`user_${user._id}`);
  }

  private async addUserSocket(user: User, socket: Socket) {
    const update = await this.updateUser(user, {
      $push: {
        sockets: socket.id,
      },
    });

    await this.updateUserObject(user);

    return update;
  }

  async unsubscribeSocket(socket: Socket, user: User) {
    await this.removeUserSocket(user, socket);

    return socket.leave(`user_${user._id}`);
  }

  private async removeUserSocket(user: User, socket: Socket) {
    const update = this.updateUser(user, {
      $pull: {
        sockets: socket.id,
      },
    });

    await this.updateUserObject(user);

    return update;
  }

  sendMessage<T>(user: User, event: string, message?: T) {
    return this.userGateway.server.to(`user_${user._id}`).emit(event, message);
  }

  sendMessageExclude<T>(
    exclude: Socket,
    user: User,
    event: string,
    message: T,
  ) {
    return exclude.broadcast.to(`user_${user._id}`).emit(event, message);
  }

  async generateUsername(base: string) {
    const name = base.replace(/\s/g, '');

    if (!(await this.getUserByName(name))) {
      return name;
    }

    return this.generateUsername(name + randomString(6));
  }

  async validateUser(id: ObjectId | string) {
    const user = await this.getUserById(id);

    if (!user) {
      throw new UnauthorizedException('Token user not found');
    }

    return user;
  }

  async getUser(username: string) {
    const user =
      (await this.getUserByName(username)) ??
      (await this.getUserByEmail(username));

    if (!user) {
      return null;
    }

    return user;
  }

  async getFilteredUser(username: string) {
    const user = await this.getUser(username);

    if (!user) {
      return null;
    }

    return this.filterUser(user);
  }

  updateUser(user: User, data: UpdateQuery<User>) {
    return this.userModel.updateOne({ _id: user._id }, data).exec();
  }

  filterUser(user: User) {
    const userObject = JSON.parse(JSON.stringify(user));

    for (const field of this.filteredFields) {
      delete userObject[field];
    }

    return userObject;
  }

  async updateUserObject(user: User) {
    const newInput = await this.getUserById(user._id);

    return Object.assign(user, newInput);
  }

  create(body: Partial<User>) {
    const user = new this.userModel(body);

    user.generateSessionToken();

    return user.save();
  }
}
