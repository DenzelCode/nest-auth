import { ConfigFactory } from 'code-config';
import { join } from 'path';
import { CONFIG_PATH } from 'src/common/config/config';

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

export const authSecretsConfig = ConfigFactory.getConfig<SecretsSchema>(
  join(CONFIG_PATH, 'auth-secrets-config.json'),
  defaultValue,
)
  .init(false)
  .save(true);
