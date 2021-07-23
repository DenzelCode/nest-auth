import { ConfigFactory } from 'code-config';
import { join } from 'path';
import { CONFIG_PATH } from '../../../common/constants/config';

interface Secret {
  appId: number | string;
  appSecret: string;
}

export interface SecretsSchema {
  facebook: Secret;
  google: Secret;
}

const defaultValue = {
  facebook: {
    appId: 1234,
    appSecret: 'secret',
  },
  google: {
    appId: 1234,
    appSecret: 'secret',
  },
};

export const authConfig = ConfigFactory.getConfig<SecretsSchema>(
  join(CONFIG_PATH, 'auth-config.json'),
  defaultValue,
)
  .init(false)
  .save(true);
