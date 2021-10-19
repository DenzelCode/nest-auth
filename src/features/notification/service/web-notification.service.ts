import { Injectable } from '@nestjs/common';
import { messaging } from 'firebase-admin';
import { PushSubscription, sendNotification } from 'web-push';

@Injectable()
export class WebNotificationService {
  sendNotification(
    subscription: PushSubscription,
    payload: messaging.WebpushConfig,
  ) {
    return sendNotification(
      subscription,
      JSON.stringify({
        ...payload,
      }),
    );
  }
}
