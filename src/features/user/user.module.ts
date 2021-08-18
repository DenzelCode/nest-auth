import { UserController } from './controller/user.controller';
import { SettingsController } from './controller/settings.controller';
import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UserService } from './service/user.service';
import { UserGateway } from './gateway/user.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/user.schema';
import { SubscriptionService } from './service/subscription.service';
import { Subscription, SubscriptionSchema } from './schema/subscription.schema';
import { NotificationModule } from '../notification/notification.module';
import { SubscriptionController } from './controller/subscription.controller';
import {
  SocketConnection,
  SocketConnectionSchema,
} from './schema/socket-connection.schema';
import { SocketConnectionService } from './service/socket-connection.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: Subscription.name,
        schema: SubscriptionSchema,
      },
      {
        name: SocketConnection.name,
        schema: SocketConnectionSchema,
      },
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => NotificationModule),
  ],
  controllers: [UserController, SettingsController, SubscriptionController],
  providers: [
    UserService,
    UserGateway,
    SubscriptionService,
    SocketConnectionService,
  ],
  exports: [
    UserService,
    UserGateway,
    SubscriptionService,
    NotificationModule,
    SocketConnectionService,
  ],
})
export class UserModule {}
