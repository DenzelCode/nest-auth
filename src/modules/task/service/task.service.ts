import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { ObjectId } from 'src/common/types/object-id';
import { Task } from '../schema/task.schema';

@Injectable()
export class TaskService {
  constructor(@InjectModel(Task.name) private taskModel: Model<Task>) {}

  create(task: Partial<Task>) {
    return new this.taskModel(task).save();
  }

  update(id: ObjectId, task: Partial<Task>) {
    return this.taskModel.findByIdAndUpdate(id, task).exec();
  }

  get(id: ObjectId) {
    return this.taskModel.findById(id).exec();
  }

  getAll(filter?: FilterQuery<Task>) {
    return this.taskModel.find(filter).exec();
  }

  delete(filter?: FilterQuery<Task>) {
    return this.taskModel.findOneAndDelete(filter);
  }
}
