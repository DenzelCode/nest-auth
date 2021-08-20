import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomString } from '../../../shared/utils/random-string';
import { User } from '../schema/user.schema';
import { Recover } from '../schema/recover.schema';
import { environments } from '../../../environments/environments';

@Injectable()
export class RecoverService {
  constructor(
    @InjectModel(Recover.name) private recoveryModel: Model<Recover>,
  ) {}

  async create(user: User) {
    await this.delete(user);

    return this.recoveryModel.create({
      code: randomString(50),
      owner: user._id,
      expiration: new Date(
        Date.now() + environments.recoverCodeExpiration * 1000,
      ),
    });
  }

  get(code: Recover['code']) {
    return this.recoveryModel.findOne({ code }).populate('owner');
  }

  delete(user: User) {
    return this.recoveryModel.deleteMany({ owner: user._id });
  }
}
