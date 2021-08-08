import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../user/schema/user.schema';
import { Task } from '../schema/task.schema';

@Injectable()
export class TaskService {
  constructor(@InjectModel(Task.name) private taskModel: Model<Task>) {}

  create(task: Partial<Task>, user: User) {
    return new this.taskModel({
      task,
      owner: user._id,
    }).save();
  }

  update(id: string, task: Partial<Task>, user: User) {
    return this.taskModel
      .updateOne(
        {
          _id: id,
          owner: user._id,
        },
        task,
      )
      .exec();
  }

  get(id: string) {
    return this.taskModel.findById(id).exec();
  }

  getAll(user: User) {
    return this.taskModel.find({ owner: user._id }).exec();
  }

  delete(id: string, user: User) {
    return this.taskModel.findOneAndDelete({
      _id: id,
      owner: user.id,
    });
  }
}
