import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schema/user.schema';
import { SubscriptionType, Subscription } from '../schema/subscription.schema';
import { MobileNotificationService } from '../../notification/service/mobile-notification.service';
import { WebNotificationService } from '../../notification/service/web-notification.service';

interface NotificationPayload {
  actions: NotificationAction[];
  badge: string;
  body: string;
  data: any;
  dir: 'auto' | 'ltr' | 'rtl';
  icon: string;
  image: string;
  lang: string;
  renotify: boolean;
  requireInteraction: boolean;
  silent: boolean;
  tag: string;
  timestamp: DOMTimeStamp;
  title: string;
  vibrate: number[];
}

@Injectable()
export class SubscriptionService {
  constructor(
    private webNotificationService: WebNotificationService,
    private mobileNotificationService: MobileNotificationService,
    @InjectModel(Subscription.name)
    private userNotificationModel: Model<Subscription>,
  ) {}

  getAll(user: User) {
    return this.userNotificationModel.find({ user: user._id }).exec();
  }

  get(user: User, type: SubscriptionType, subscription: string) {
    return this.userNotificationModel
      .findOne({ user: user._id, type, subscription })
      .exec();
  }

  create(user: User, type: SubscriptionType, subscription: string) {
    return new this.userNotificationModel({
      user: user._id,
      type,
      subscription,
    }).save();
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
