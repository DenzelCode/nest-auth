import { Injectable, Logger } from '@nestjs/common';
import { messaging } from 'firebase-admin';
import { fcm } from '../api/firebase';

@Injectable()
export class MobileNotificationService {
  async sendNotification(
    token: string | string[],
    payload: messaging.MessagingPayload,
  ) {
    for (const key of Object.keys(payload.data || {})) {
      if (typeof payload.data[key] === 'object') {
        delete payload.data[key];
      }
    }

    new Logger().debug(`this is the payload: ${JSON.stringify(payload)}`);

    return fcm.sendToDevice(token, payload);
  }
}
