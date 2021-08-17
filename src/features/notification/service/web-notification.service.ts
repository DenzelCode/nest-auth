import { Injectable } from '@nestjs/common';
import { messaging } from 'firebase-admin';
import { PushSubscription, sendNotification } from 'web-push';

export interface WebpushConfig {
  action?: string;
}

@Injectable()
export class WebNotificationService {
  sendNotification(
    subscription: PushSubscription,
    payload: messaging.WebpushConfig & WebpushConfig,
  ) {
    return sendNotification(subscription, JSON.stringify(payload));
  }
}
