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
  apple: {
    clientId: string;
    teamId: string;
    keyIdentifier: string;
    redirectUri: string;
  };
}

const defaultValue: SecretsSchema = {
  facebook: {
    appId: 1234,
    appSecret: 'secret',
  },
  google: {
    appId: 1234,
    appSecret: 'secret',
  },
  apple: {
    clientId: 'com.code.auth',
    teamId: 'XQ4XH57P3K',
    keyIdentifier: '7DBG84VR62',
    redirectUri: '',
  },
};

export const authConfig = ConfigFactory.getConfig<SecretsSchema>(
  join(CONFIG_PATH, 'auth-config.json'),
  defaultValue,
)
  .init(false)
  .save(true);
