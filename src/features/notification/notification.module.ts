import { forwardRef, Module, OnModuleInit } from '@nestjs/common';
import { NotificationController } from './controller/notification.controller';
import { MobileNotificationService } from './service/mobile-notification.service';
import { WebNotificationService } from './service/web-notification.service';
import { generateVAPIDKeys, setVapidDetails } from 'web-push';
import { notificationConfig } from './config/notification.config';
import { AuthModule } from '../auth/auth.module';
import { initializeApp } from 'firebase-admin';
import { ConfigService } from '@nestjs/config';
import { GlobalConfig } from '../../shared/types/global-config';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [NotificationController],
  providers: [MobileNotificationService, WebNotificationService],
  exports: [MobileNotificationService, WebNotificationService],
})
export class NotificationModule implements OnModuleInit {
  constructor(private configService: ConfigService<GlobalConfig>) {}

  onModuleInit() {
    const vapid = notificationConfig.vapid;

    const envSubject = this.configService.get('VAPID_SUBJECT');
    const envPrivateKey = this.configService.get('VAPID_PRIVATE_KEY');
    const envPublicKey = this.configService.get('VAPID_PUBLIC_KEY');

    vapid.subject = envSubject || vapid.subject;
    vapid.publicKey = envPublicKey || vapid.publicKey;
    vapid.privateKey = envPrivateKey || vapid.privateKey;

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
