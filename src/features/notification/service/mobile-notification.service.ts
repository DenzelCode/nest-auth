import { Injectable } from '@nestjs/common';
import { messaging } from 'firebase-admin';
import { fcm } from '../api/firebase';

@Injectable()
export class MobileNotificationService {
  async sendNotification(
    token: string | string[],
    payload: messaging.MessagingPayload,
  ) {
    delete payload.notification.data;

    return fcm.sendToDevice(token, payload);
  }
}
