import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { UserService } from '../service/user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get(':username')
  async getUser(@Param('username') username: string) {
    return this.userService.validateUserByName(username);
  }
}
