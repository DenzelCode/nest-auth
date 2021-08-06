import { SecretsSchema } from './auth.config';

export const authConfigDefault: SecretsSchema = {
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
