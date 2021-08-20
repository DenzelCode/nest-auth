import { ConfigFactory } from 'code-config/dist';
import { join } from 'path';
import { PATHS } from '../../../shared/constants/paths';

const defaultValue = {
  vapid: {
    subject: 'mailto:example@example.com',
    privateKey: '',
    publicKey: '',
  },
};

export const notificationConfig = ConfigFactory.getConfig(
  join(PATHS.config, 'notification.config.json'),
  defaultValue,
);

notificationConfig.initPrettify();
