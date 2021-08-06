import { ConfigFactory } from 'code-config';
import { join } from 'path';
import { CONFIG_PATH } from '../../../shared/constants/config';
import { authConfigDefault } from './auth-config.default';

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

export const authConfig = ConfigFactory.getConfig<SecretsSchema>(
  join(CONFIG_PATH, 'auth.config.json'),
  authConfigDefault,
)
  .init(false)
  .save(true);
