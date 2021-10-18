import { Injectable, Logger } from '@nestjs/common';
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
  private logger = new Logger('SubscriptionService');

  constructor(
    private webNotificationService: WebNotificationService,
    private mobileNotificationService: MobileNotificationService,
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<Subscription>,
  ) {}

  getAll(user: User) {
    return this.subscriptionModel.find({ user: user._id });
  }

  get(user: User, type: SubscriptionType, subscription: string) {
    return this.subscriptionModel.findOne({
      user: user._id,
      type,
      subscription,
    });
  }

  create(user: User, type: SubscriptionType, subscription: string) {
    return this.subscriptionModel.create({
      user: user._id,
      type,
      subscription,
    });
  }

  delete(user: User, type: SubscriptionType, subscription: string) {
    return this.subscriptionModel.findOneAndDelete({
      user: user._id,
      type,
      subscription,
    });
  }

  deleteAll(user: User) {
    return this.subscriptionModel.deleteMany({ user: user._id });
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
            .catch(e => this.logger.debug(`${subscription.type} ${e}`));
          break;
        case SubscriptionType.Mobile:
          this.mobileNotificationService
            .sendNotification(subscription.subscription, {
              notification: payload,
            })
            .catch(e => this.logger.debug(`${subscription.type} ${e}`));
          break;
        default:
          break;
      }
    }
  }
}
