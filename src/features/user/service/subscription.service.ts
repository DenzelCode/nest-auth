import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schema/user.schema';
import { SubscriptionType, Subscription } from '../schema/subscription.schema';
import { MobileNotificationService } from '../../notification/service/mobile-notification.service';
import { WebNotificationService } from '../../notification/service/web-notification.service';
import { messaging } from 'firebase-admin';

interface CustomNotification {
  data: {
    url: string;
  };
}

export type NotificationPayload = messaging.NotificationMessagePayload &
  messaging.WebpushNotification &
  CustomNotification;

@Injectable()
export class SubscriptionService {
  constructor(
    private webNotificationService: WebNotificationService,
    private mobileNotificationService: MobileNotificationService,
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<Subscription>,
  ) {}

  getAll(user: User) {
    return this.subscriptionModel.where({ user: user._id }).find();
  }

  get(user: User, type: SubscriptionType, subscription: string) {
    return this.subscriptionModel
      .where({ user: user._id, type, subscription })
      .findOne();
  }

  create(user: User, type: SubscriptionType, subscription: string) {
    return this.subscriptionModel.create({
      user: user._id,
      type,
      subscription,
    });
  }

  delete(user: User, type: SubscriptionType, subscription: string) {
    return this.subscriptionModel
      .where({ user: user._id, type, subscription })
      .deleteOne();
  }

  deleteAll(user: User) {
    return this.subscriptionModel.where({ user: user._id }).deleteMany();
  }

  async sendNotification(user: User, payload: Partial<NotificationPayload>) {
    const subscriptions = await this.getAll(user);

    for (const subscription of subscriptions) {
      switch (subscription.type) {
        case SubscriptionType.Web:
          this.webNotificationService
            .sendNotification(JSON.parse(subscription.subscription), {
              notification: payload,
            })
            .catch(() => {});
          break;
        case SubscriptionType.Mobile:
          this.mobileNotificationService
            .sendNotification(subscription.subscription, {
              notification: payload,
            })
            .catch(() => {});
          break;
        default:
          break;
      }
    }
  }
}
