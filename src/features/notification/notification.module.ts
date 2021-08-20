import { forwardRef, Module, OnModuleInit } from '@nestjs/common';
import { NotificationController } from './controller/notification.controller';
import { MobileNotificationService } from './service/mobile-notification.service';
import { WebNotificationService } from './service/web-notification.service';
import { generateVAPIDKeys, setVapidDetails } from 'web-push';
import { notificationConfig } from './config/notification.config';
import { AuthModule } from '../auth/auth.module';
import { environments } from '../../environments/environments';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [NotificationController],
  providers: [MobileNotificationService, WebNotificationService],
  exports: [MobileNotificationService, WebNotificationService],
})
export class NotificationModule implements OnModuleInit {
  onModuleInit() {
    const vapid = notificationConfig.vapid;
    const envVapid = environments.vapid;

    vapid.publicKey = envVapid.publicKey || vapid.publicKey;
    vapid.privateKey = envVapid.privateKey || vapid.privateKey;
    vapid.subject = envVapid.subject || vapid.subject;

    if (vapid.publicKey && vapid.privateKey) {
      setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);

      return;
    }

    const { privateKey, publicKey } = generateVAPIDKeys();

    notificationConfig.vapid = {
      ...vapid,
      privateKey,
      publicKey,
    };

    notificationConfig.save();
  }
}
