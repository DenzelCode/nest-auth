import { MailerOptions } from '@nestjs-modules/mailer';
import { ConfigFactory } from 'code-config';
import { join } from 'path';
import { CONFIG_PATH } from '../../../common/config/config';

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
  join(CONFIG_PATH, 'mailer.config.json'),
  defaultValue,
)
  .init(false)
  .save(true);
