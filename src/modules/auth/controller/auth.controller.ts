import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { User } from '../../user/schema/user.schema';
import { UserService } from '../../user/service/user.service';
import { CurrentUser } from '../decorators/current-user.decorator';
import { AuthService } from '../service/auth.service';
import { JwtAuthGuard } from '../guard/jwt-auth.guard';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { FacebookAuthService } from 'facebook-auth-nestjs';
import { GoogleAuthService } from '../service/google-auth.service';
import { AppleAuthService } from '../service/apple-auth.service';
import { AppleLoginDto } from '../dto/apple-login.dto';
import { Dictionary } from 'code-config';
import { Response } from 'express';
import { authConfig } from '../config/auth.config';
import { stringify } from 'qs';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private facebookService: FacebookAuthService,
    private googleService: GoogleAuthService,
    private appleService: AppleAuthService,
  ) {}

  @Post('login')
  async login(@Body() body: LoginDto) {
    const user = await this.authService.validate(body.username, body.password);

    return this.authService.login(user);
  }

  @Post('facebook-login')
  async facebookLogin(@Body('accessToken') accessToken: string) {
    return this.authService.loginWithThirdParty('facebookId', () =>
      this.facebookService.getUser(
        accessToken,
        'id',
        'name',
        'email',
        'first_name',
        'last_name',
      ),
    );
  }

  @Post('google-login')
  async googleLogin(@Body('accessToken') accessToken: string) {
    return this.authService.loginWithThirdParty('googleId', () =>
      this.googleService.getUser(accessToken),
    );
  }

  @Post('apple-login')
  async appleLogin(@Body() body: AppleLoginDto) {
    return this.authService.loginWithThirdParty('appleId', () =>
      this.appleService.getUser(body),
    );
  }

  @Post('refresh-token')
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.authService.loginWithRefreshToken(refreshToken);
  }

  @Post('register')
  async register(@Body() body: RegisterDto) {
    if (await this.userService.getUserByName(body.username)) {
      throw new BadRequestException('Username already exists');
    }

    if (await this.userService.getUserByEmail(body.email)) {
      throw new BadRequestException('Email already exists');
    }

    const user = await this.userService.create(body);

    return this.authService.login(user);
  }

  @Post('apple-callback')
  appleCallback(@Body() body: Dictionary, @Res() res: Response) {
    console.log(body);

    const apple = authConfig.apple;

    const uri = `intent://callback?${stringify(body)}#Intent;package=${
      apple.androidPackageId
    };scheme=signinwithapple;end`;

    return res.redirect(uri);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('logout-from-all-devices')
  async logoutFromAllDevices(@CurrentUser() user: User) {
    user.generateSessionToken();

    await user.save();

    return this.authService.login(user);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: User) {
    return this.userService.filterUser(user);
  }
}
