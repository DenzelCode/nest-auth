import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { RegisterDto } from 'src/modules/auth/dto/register.dto';
import { User } from '../schema/user.schema';
import { use } from 'passport';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  getUserByName(name: string) {
    const username = { $regex: new RegExp(`^${name}$`, 'i') };

    return this.userModel.findOne({ username }).exec();
  }

  getUserByEmail(mail: string) {
    const email = { $regex: new RegExp(`^${mail}$`, 'i') };

    return this.userModel.findOne({ email }).exec();
  }

  getUserById(id: ObjectId | string) {
    return this.userModel.findById(id).exec();
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

  updateUser(user: User, data: Partial<User>) {
    return this.userModel.updateOne({ _id: user._id }, data).exec();
  }

  filterUser(user: User) {
    const userObject = JSON.parse(JSON.stringify(user));

    delete userObject.password;

    return userObject;
  }

  create(body: RegisterDto) {
    const user = new this.userModel(body);

    user.generateSessionToken();

    return user.save();
  }
}
