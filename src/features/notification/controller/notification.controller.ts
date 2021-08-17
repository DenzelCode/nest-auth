import { Controller, Get, UseGuards } from '@nestjs/common';
import { notificationConfig } from '../config/notification.config';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('notification')
export class NotificationController {
  @Get('config')
  getConfig() {
    return { webPublicKey: notificationConfig.vapid.publicKey };
  }
}
