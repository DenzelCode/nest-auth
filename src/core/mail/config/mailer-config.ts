import { MailerOptions } from '@nestjs-modules/mailer';
import { ConfigFactory } from 'code-config';
import { join } from 'path';

export interface MailerSchema {
  transport: MailerOptions['transport'];
  defaults: MailerOptions['defaults'];
}

export const mailerConfig = ConfigFactory.getConfig<MailerSchema>(
  join(__dirname, '../../../../config/mailer-config.json'),
  {
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
  },
)
  .init(false)
  .save(true);
