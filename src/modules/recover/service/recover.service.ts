import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/modules/user/schema/user.schema';
import { randomString } from 'src/utils/random-string';
import { Recover } from '../schema/recover.schema';

@Injectable()
export class RecoverService {
  constructor(
    @InjectModel(Recover.name) private recoveryModel: Model<Recover>,
    private configService: ConfigService,
  ) {}

  async create(user: User) {
    await this.delete(user);

    return new this.recoveryModel({
      code: randomString(50),
      owner: user._id,
      expiration: new Date(Date.now() + this.configService.get<number>('CODE_EXPIRATION') * 1000),
    }).save();
  }

  get(code: Recover['code']) {
    return this.recoveryModel
      .findOne({ code })
      .populate('owner')
      .exec();
  }

  delete(user: User) {
    return this.recoveryModel.deleteMany({ owner: user._id }).exec();
  }
}
