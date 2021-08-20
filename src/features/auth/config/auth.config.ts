import { ConfigFactory } from 'code-config';
import { join } from 'path';
import { PATHS } from '../../../shared/constants/paths';
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
  join(PATHS.config, 'auth.config.json'),
  authConfigDefault,
);

authConfig.initPrettify();
