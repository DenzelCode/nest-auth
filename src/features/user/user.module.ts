import { UserController } from './controller/user.controller';
import { SettingsController } from './controller/settings.controller';
import {
  forwardRef,
  Module,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
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
import { Recover, RecoverSchema } from './schema/recover.schema';
import { RecoverController } from './controller/recover.controller';
import { RecoverService } from './service/recover.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: Recover.name,
        schema: RecoverSchema,
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
  controllers: [
    UserController,
    SettingsController,
    SubscriptionController,
    RecoverController,
  ],
  providers: [
    UserService,
    UserGateway,
    SubscriptionService,
    SocketConnectionService,
    RecoverService,
  ],
  exports: [
    UserService,
    UserGateway,
    SubscriptionService,
    NotificationModule,
    SocketConnectionService,
  ],
})
export class UserModule implements OnModuleInit, OnModuleDestroy {
  constructor(private socketConnectionService: SocketConnectionService) {}

  onModuleInit() {
    return this.deleteConnections();
  }

  onModuleDestroy() {
    return this.deleteConnections();
  }

  private deleteConnections() {
    return this.socketConnectionService.deleteAllConnections();
  }
}
