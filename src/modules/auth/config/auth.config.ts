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
    iOSClientId: string;
    webClientId: string;
    androidClientId: string;
    androidPackageId: string;
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
    iOSClientId: 'com.code.auth',
    androidClientId: 'nest-auth.ubbly.club',
    androidPackageId: 'com.code.auth',
    webClientId: 'nest-auth.ubbly.club',
    teamId: '',
    keyIdentifier: '',
    redirectUri: '',
  },
};

export const authConfig = ConfigFactory.getConfig<SecretsSchema>(
  join(CONFIG_PATH, 'auth.config.json'),
  defaultValue,
)
  .init(false)
  .save(true);
