import {
  BadRequestException,
  Body,
  Controller,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { UpdateEmailDto } from '../dto/update-email.dto';
import { UpdatePasswordDto } from '../dto/update-password.dto';
import { User } from '../schema/user.schema';
import { UserService } from '../service/user.service';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private userService: UserService) {}

  @Put('username')
  async updateUsername(
    @CurrentUser() user: User,
    @Body('username') username: string,
  ) {
    const usernameUser = await this.userService.getUserByName(username);

    if (usernameUser) {
      throw new BadRequestException('Username already exists');
    }

    user.username = username;

    return user.save();
  }

  @Put('email')
  async updateEmail(@CurrentUser() user: User, @Body() body: UpdateEmailDto) {
    const emailUser = await this.userService.getUserByEmail(body.email);

    if (emailUser) {
      throw new BadRequestException('Email already exists');
    }

    user.email = body.email;

    return user.save();
  }

  @Put('password')
  async updatePassword(
    @CurrentUser() user: User,
    @Body() body: UpdatePasswordDto,
  ) {
    if (
      !user.isSocial &&
      !(await user.validatePassword(body.currentPassword))
    ) {
      throw new BadRequestException('Current password does not match');
    }

    if (body.password !== body.confirmPassword) {
      throw new BadRequestException('Passwords does not match');
    }

    if (await user.validatePassword(body.password)) {
      throw new BadRequestException('Do not use your current password');
    }

    user.password = body.password;

    return user.save();
  }
}
