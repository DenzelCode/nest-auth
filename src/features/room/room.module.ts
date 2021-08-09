import { RoomService } from './service/room.service';
import { RoomController } from './controller/room.controller';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Room, RoomSchema } from './schema/room.schema';
import { AuthModule } from '../auth/auth.module';
import { RoomGateway } from './gateway/room.gateway';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      {
        name: Room.name,
        schema: RoomSchema,
      },
    ]),
  ],
  controllers: [RoomController],
  providers: [RoomService, RoomGateway],
  exports: [RoomService, RoomGateway],
})
export class RoomModule {}
