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
import { SubscriptionService } from '../../user/service/subscription.service';
import { AuthNotRequired } from '../decorators/auth-not-required.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private facebookService: FacebookAuthService,
    private googleService: GoogleAuthService,
    private appleService: AppleAuthService,
    private subscriptionService: SubscriptionService,
  ) {}

  @Post('login')
  async login(@Body() body: LoginDto) {
    return this.authService.login(
      await this.authService.validate(body.username, body.password),
    );
  }

  @Post('facebook-login')
  @AuthNotRequired()
  @UseGuards(JwtAuthGuard)
  async facebookLogin(
    @CurrentUser() user: User,
    @Body('accessToken') accessToken: string,
  ) {
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
  @AuthNotRequired()
  @UseGuards(JwtAuthGuard)
  async googleLogin(
    @CurrentUser() user: User,
    @Body('accessToken') accessToken: string,
  ) {
    return this.authService.loginWithThirdParty(
      'googleId',
      () => this.googleService.getUser(accessToken),
      user,
    );
  }

  @Post('apple-login')
  @AuthNotRequired()
  @UseGuards(JwtAuthGuard)
  async appleLogin(@CurrentUser() user: User, @Body() body: AppleLoginDto) {
    return this.authService.loginWithThirdParty(
      'appleId',
      () => this.appleService.getUser(body),
      user,
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
    const uri = `intent://callback?${stringify(body)}#Intent;package=${
      authConfig.apple.android.packageId
    };scheme=signinwithapple;end`;

    return res.redirect(uri);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('logout-from-all-devices')
  async logoutFromAllDevices(@CurrentUser() user: User) {
    user.generateSessionToken();

    await user.save();

    await this.subscriptionService.deleteAll(user);

    return this.authService.login(user);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: User) {
    return this.userService.filterUser(user, ['email']);
  }
}
