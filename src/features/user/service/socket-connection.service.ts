import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SocketConnection } from '../schema/socket-connection.schema';

@Injectable()
export class SocketConnectionService {
  constructor(
    @InjectModel(SocketConnection.name)
    private socketConnectionModel: Model<SocketConnection>,
  ) {}

  getBySocketId(id: string) {
    return this.socketConnectionModel
      .findOne({ socketId: id })
      .populate('user');
  }

  async deleteConnection(connection: SocketConnection) {
    const sockett = await this.socketConnectionModel.findById(connection._id).w;

    return;
  }
}
