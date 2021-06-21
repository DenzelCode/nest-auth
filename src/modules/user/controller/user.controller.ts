import { BadRequestException, Body, Controller, Put, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/modules/auth/guard/jwt-auth.guard';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../schema/user.schema';
import { UserService } from '../service/user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Put('update')
  @UseGuards(JwtAuthGuard)
  async updateUser(@CurrentUser() user: User, @Body() body: UpdateUserDto) {
    const updatedData: Partial<User> = {};

    if (user.username !== body.username) {
      const usernameUser = await this.userService.getUserByName(body.username);

      if (usernameUser) {
        throw new BadRequestException('Username already exists');
      }

      updatedData.username = body.username;
    }

    if (user.email !== body.email) {
      const emailUser = await this.userService.getUserByName(body.email);

      if (emailUser) {
        throw new BadRequestException('Email already exists');
      }

      updatedData.email = body.email;
    }

    if (body.password) {
      if (!(await user.validatePassword(body.currentPassword))) {
        throw new BadRequestException('Current password does not match');
      }

      if (body.password !== body.confirmPassword) {
        throw new BadRequestException('Passwords does not match');
      }

      updatedData.password = body.password;
    }

    Object.assign(user, updatedData);

    return user.save();
  }
}
