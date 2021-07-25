import { ConfigFactory } from 'code-config';
import { join } from 'path';
import { CONFIG_PATH } from '../../../common/constants/config';

interface Secret {
  appId: number | string;
  appSecret: string;
}

interface Platform {
  clientId: string;
  redirectUri: string;
  packageId?: string;
}

export interface SecretsSchema {
  facebook: Secret;
  google: Secret;
  apple: {
    ios: Platform;
    web: Platform;
    android: Platform;
    teamId: string;
    keyIdentifier: string;
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
    ios: {
      clientId: 'com.code.auth',
      packageId: 'com.code.auth',
      redirectUri: 'https://nest-auth.ubbly.club/',
    },
    android: {
      clientId: 'nest-auth.ubbly.club',
      packageId: 'com.code.auth',
      redirectUri: 'https://nest-auth.ubbly.club/api/auth/apple-callback',
    },
    web: {
      clientId: 'nest-auth.ubbly.club',
      redirectUri: 'https://nest-auth.ubbly.club/',
    },
    teamId: '',
    keyIdentifier: '',
  },
};

export const authConfig = ConfigFactory.getConfig<SecretsSchema>(
  join(CONFIG_PATH, 'auth.config.json'),
  defaultValue,
)
  .init(false)
  .save(true);
