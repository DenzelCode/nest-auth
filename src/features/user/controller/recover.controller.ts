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
import { UserService } from '../service/user.service';
import { Recover } from '../schema/recover.schema';
import { RecoverService } from '../service/recover.service';
import { RecoverPasswordDto } from '../dto/recover-password.dto';
import { UpdatePasswordDto } from '../dto/update-password.dto';
import { environments } from '../../../environments/environments';
import { User } from '../schema/user.schema';

@Controller('recover')
export class RecoverController {
  constructor(
    private userService: UserService,
    private recoverService: RecoverService,
    private mailerService: MailerService,
  ) {}

  @Get(':code')
  async validateRecoverCode(@Param('code') code: Recover['code']) {
    const recover = await this.validateCode(code);

    recover.owner = this.userService.filterUser(recover.owner) as User;

    return recover;
  }

  @Post()
  async recoverPassword(@Body() body: RecoverPasswordDto) {
    const user = await this.userService.validateUserByEmail(body.email);

    const { code, expiration } = await this.recoverService.create(user);

    const url = environments.frontEndUrl;

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
    @Body() body: UpdatePasswordDto,
  ) {
    const recover = await this.validateCode(code);

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

  private async validateCode(code: string) {
    const recover = await this.recoverService.get(code);

    if (!recover) {
      throw new NotFoundException('Code not found');
    }

    if (recover.expiration?.getTime() < Date.now()) {
      await this.recoverService.delete(recover.owner);

      throw new NotFoundException('Code has expired');
    }

    return recover;
  }
}
