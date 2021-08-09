import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { RecoverModule } from './recover/recover.module';
import { RoomModule } from './room/room.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [AuthModule, UserModule, RecoverModule, RoomModule],
  controllers: [],
  exports: [AuthModule, UserModule, RecoverModule, RoomModule],
})
export class FeaturesModule {}
