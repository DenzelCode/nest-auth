import { Injectable } from '@nestjs/common';
import { Dictionary } from 'code-config/dist';
import { PushSubscription, sendNotification } from 'web-push';

@Injectable()
export class WebNotificationService {
  sendNotification(subscription: PushSubscription, payload: Dictionary) {
    return sendNotification(subscription, JSON.stringify(payload));
  }
}
