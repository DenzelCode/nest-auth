import { config } from 'dotenv';

config();

const env = process.env;

export const environments = {
  port: Number(env.PORT || 3000),
  mongoUri: env.MONGO_URI,
  proxyEnabled: env.PROXY_ENABLED === 'true',
  frontEndUrl: env.FRONTEND_URL,
  accessTokenSecret: env.ACCESS_TOKEN_SECRET,
  accessTokenExpiration: env.ACCESS_TOKEN_EXPIRATION,
  refreshTokenSecret: env.REFRESH_TOKEN_SECRET,
  refreshTokenExpiration: env.REFRESH_TOKEN_EXPIRATION,
  recoverCodeExpiration: Number(env.RECOVER_CODE_EXPIRATION),
  redis: {
    enabled: env.REDIS_ENABLED === 'true',
    host: env.REDIS_HOST,
    port: Number(env.REDIS_PORT),
  },
  vapid: {
    publicKey: env.VAPID_PUBLIC_KEY,
    privateKey: env.VAPID_PRIVATE_KEY,
    subject: env.VAPID_SUBJECT,
  },
};
