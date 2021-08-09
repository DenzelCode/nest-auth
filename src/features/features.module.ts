import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MessagesModule } from './messages/messages.module';
import { RecoverModule } from './recover/recover.module';
import { RoomModule } from './room/room.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [AuthModule, UserModule, RecoverModule, RoomModule, MessagesModule],
  controllers: [],
  exports: [AuthModule, UserModule, RecoverModule, RoomModule, MessagesModule],
})
export class FeaturesModule {}
