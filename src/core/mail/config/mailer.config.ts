import { MailerOptions } from '@nestjs-modules/mailer';
import { ConfigFactory } from 'code-config';
import { join } from 'path';
import { PATHS } from '../../../shared/constants/paths';

export interface MailerSchema {
  transport: MailerOptions['transport'];
  defaults: MailerOptions['defaults'];
}

const defaultValue = {
  transport: {
    host: 'smtp.example.com',
    secure: false,
    auth: {
      user: 'user@example.com',
      pass: 'topsecret',
    },
  },
  defaults: {
    from: '"No Reply" <noreply@example.com>',
  },
};

export const mailerConfig = ConfigFactory.getConfig<MailerSchema>(
  join(PATHS.config, 'mailer.config.json'),
  defaultValue,
);

mailerConfig.initPrettify();
