import { RoomService } from './service/room.service';
import { RoomController } from './controller/room.controller';

import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Room, RoomSchema } from './schema/room.schema';
import { AuthModule } from '../auth/auth.module';
import { RoomGateway } from './gateway/room.gateway';
import { MessagesModule } from '../messages/messages.module';
import { SharedModule } from '../../shared/shared.module';

@Module({
  imports: [
    AuthModule,
    forwardRef(() => MessagesModule),
    MongooseModule.forFeature([
      {
        name: Room.name,
        schema: RoomSchema,
      },
    ]),
    SharedModule,
  ],
  controllers: [RoomController],
  providers: [RoomService, RoomGateway],
  exports: [RoomService, RoomGateway],
})
export class RoomModule {}
