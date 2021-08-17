import { Injectable } from '@nestjs/common';
import { Dictionary } from 'code-config/dist';

@Injectable()
export class MobileNotificationService {
  async sendNotification(subscription: string, payload: Dictionary) {}
}
