import {
  BadRequestException,
  Body,
  Controller,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/modules/auth/guard/jwt-auth.guard';
import { UpdateEmailDto } from '../dto/update-email.dto';
import { UpdatePasswordDto } from '../dto/update-password.dto';
import { UpdateUsernameDto } from '../dto/update-username.dto';
import { User } from '../schema/user.schema';
import { UserService } from '../service/user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Put('update/username')
  @UseGuards(JwtAuthGuard)
  async updateUsername(
    @CurrentUser() user: User,
    @Body() body: UpdateUsernameDto,
  ) {
    const usernameUser = await this.userService.getUserByName(body.username);

    if (usernameUser) {
      throw new BadRequestException('Username already exists');
    }

    user.username = body.username;

    return user.save();
  }

  @Put('update/email')
  @UseGuards(JwtAuthGuard)
  async updateEmail(@CurrentUser() user: User, @Body() body: UpdateEmailDto) {
    const emailUser = await this.userService.getUserByName(body.email);

    if (emailUser) {
      throw new BadRequestException('Email already exists');
    }

    user.email = body.email;

    return user.save();
  }

  @Put('update/password')
  @UseGuards(JwtAuthGuard)
  async updatePassword(
    @CurrentUser() user: User,
    @Body() body: UpdatePasswordDto,
  ) {
    if (!(await user.validatePassword(body.currentPassword))) {
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
