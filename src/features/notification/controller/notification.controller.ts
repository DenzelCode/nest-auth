import { Controller, Get } from '@nestjs/common';
import { notificationConfig } from '../config/notification.config';
import { MobileNotificationService } from '../service/mobile-notification.service';
import { WebNotificationService } from '../service/web-notification.service';

@Controller('notification')
export class NotificationController {
  constructor(
    private webNotificationService: WebNotificationService,
    private mobileNotificationService: MobileNotificationService,
  ) {}

  @Get('config')
  getWebConfig() {
    return {
      publicKey: notificationConfig.vapid.publicKey,
    };
  }
}
