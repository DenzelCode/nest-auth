import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GlobalConfig } from '../../../shared/types/global-config';
import { randomString } from '../../../shared/utils/random-string';
import { User } from '../../user/schema/user.schema';
import { Recover } from '../schema/recover.schema';

@Injectable()
export class RecoverService {
  constructor(
    @InjectModel(Recover.name) private recoveryModel: Model<Recover>,
    private configService: ConfigService<GlobalConfig>,
  ) {}

  async create(user: User) {
    await this.delete(user);

    return this.recoveryModel.create({
      code: randomString(50),
      owner: user._id,
      expiration: new Date(
        Date.now() + this.configService.get<number>('CODE_EXPIRATION') * 1000,
      ),
    });
  }

  get(code: Recover['code']) {
    return this.recoveryModel
      .where({ code })
      .populate('owner')
      .findOne();
  }

  delete(user: User) {
    return this.recoveryModel.where({ owner: user._id }).deleteMany();
  }
}
