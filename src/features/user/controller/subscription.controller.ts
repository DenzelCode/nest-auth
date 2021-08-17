import {
  BadRequestException,
  Body,
  Controller,
  Delete,
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
  constructor(private SubscriptionService: SubscriptionService) {}

  @Get()
  sendTestingNotification(@CurrentUser() user: User) {
    return this.SubscriptionService.sendNotification(user, {
      title: 'Testing',
      body: 'Testing notification',
    });
  }

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

    const subscription = await this.SubscriptionService.get(
      user,
      type,
      body,
    );

    return (
      subscription || this.SubscriptionService.create(user, type, body)
    );
  }

  @Delete('web')
  deleteWebSubscription(
    @Body('subscription') body: PushSubscriptionJSON,
    @CurrentUser() user: User,
  ) {
    return this.deleteSubscription(
      user,
      SubscriptionType.Web,
      JSON.stringify(body),
    );
  }

  @Delete('mobile')
  deleteMobileSubscription(
    @Body('subscription') body: string,
    @CurrentUser() user: User,
  ) {
    return this.deleteSubscription(user, SubscriptionType.Mobile, body);
  }

  private async deleteSubscription(
    user: User,
    type: SubscriptionType,
    body: string,
  ) {
    if (!body) {
      throw new BadRequestException('Subscription body empty');
    }

    return this.SubscriptionService.delete(user, type, body);
  }
}
