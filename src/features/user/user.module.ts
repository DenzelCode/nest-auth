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

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
    MongooseModule.forFeature([
      {
        name: Subscription.name,
        schema: SubscriptionSchema,
      },
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => NotificationModule),
  ],
  controllers: [UserController, SettingsController, SubscriptionController],
  providers: [UserService, UserGateway, SubscriptionService],
  exports: [UserService, UserGateway, SubscriptionService, NotificationModule],
})
export class UserModule {}
