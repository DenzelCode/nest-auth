import { MailerService } from '@nestjs-modules/mailer';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GlobalConfig } from '../../../shared/types/global-config';
import { UserService } from '../service/user.service';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { Recover } from '../schema/recover.schema';
import { RecoverService } from '../service/recover.service';
import { RecoverPasswordDto } from '../dto/recover-password.dto';

@Controller('recover')
export class RecoverController {
  constructor(
    private userService: UserService,
    private recoverService: RecoverService,
    private mailerService: MailerService,
    private configService: ConfigService<GlobalConfig>,
  ) {}

  @Get(':code')
  async validateCode(@Param('code') code: Recover['code']) {
    const recover = await this.recoverService.get(code);

    if (!recover) {
      throw new NotFoundException('Code not found');
    }

    if (recover.expiration?.getTime() < Date.now()) {
      await this.recoverService.delete(recover.owner);

      throw new NotFoundException('Code has expired');
    }

    recover.owner = this.userService.filterUser(recover.owner);

    return recover;
  }

  @Post()
  async recoverPassword(@Body() body: RecoverPasswordDto) {
    const user = await this.userService.getUserByEmail(body.email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { code, expiration } = await this.recoverService.create(user);

    const url = this.configService.get('FRONTEND_URL');

    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Recover your password',
        template: './recover', // This will fetch /template/recover.hbs
        context: {
          name: user.username,
          url,
          code,
          expiration: Math.round(
            (expiration.getTime() - Date.now()) / 1000 / 60 / 60,
          ),
        },
      });
    } catch (e) {
      throw new InternalServerErrorException(
        `An error occurred sending email: ${e.message}`,
      );
    }
  }

  @Post(':code')
  async changePassword(
    @Param('code') code: Recover['code'],
    @Body() body: ChangePasswordDto,
  ) {
    const recover = await this.recoverService.get(code);

    if (!recover) {
      throw new NotFoundException('Code not found');
    }

    if (body.password !== body.confirmPassword) {
      throw new BadRequestException(`Passwords does not match`);
    }

    const user = recover.owner;

    if (await user.validatePassword(body.password)) {
      throw new BadRequestException('Do not use your current password');
    }

    user.password = body.password;

    await this.recoverService.delete(user);

    return this.userService.filterUser(await user.save());
  }
}
