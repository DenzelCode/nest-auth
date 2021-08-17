import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { SubscriptionType } from '../schema/subscription.schema';
import { User } from '../schema/user.schema';
import { SubscriptionService } from '../service/subscription.service';

@UseGuards(JwtAuthGuard)
@Controller('subscription')
export class SubscriptionController {
  constructor(private userNotificationService: SubscriptionService) {}

  @Post('web')
  createWebSubscription(
    @Body('subscription') body: PushSubscriptionJSON,
    @CurrentUser() user: User,
  ) {
    return this.createSubscription(
      user,
      SubscriptionType.Web,
      JSON.stringify(body),
    );
  }

  @Post('mobile')
  createMobileSubscription(
    @Body('subscription') body: string,
    @CurrentUser() user: User,
  ) {
    return this.createSubscription(user, SubscriptionType.Mobile, body);
  }

  private async createSubscription(
    user: User,
    type: SubscriptionType,
    body: string,
  ) {
    if (!body) {
      throw new BadRequestException('Subscription body empty');
    }

    const subscription = await this.userNotificationService.get(
      user,
      type,
      body,
    );

    return (
      subscription || this.userNotificationService.create(user, type, body)
    );
  }

  @Get()
  sendTestingNotification(@CurrentUser() user: User) {
    return this.userNotificationService.sendNotification(user, {
      title: 'Testing',
      body: 'Testing notification',
    });
  }
}
