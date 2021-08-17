import { Injectable } from '@nestjs/common';
import { messaging } from 'firebase-admin';
import { fcm } from '../api/firebase';

@Injectable()
export class MobileNotificationService {
  async sendNotification(
    token: string | string[],
    payload: messaging.MessagingPayload,
  ) {
    return fcm.sendToDevice(token, payload);
  }
}
