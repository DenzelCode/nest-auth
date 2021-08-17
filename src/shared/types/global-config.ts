export interface GlobalConfig {
  PROXY_ENABLED: 'true' | 'false';
  PORT: number;
  ACCESS_TOKEN_SECRET: string;
  ACCESS_TOKEN_EXPIRATION: string;
  REFRESH_TOKEN_SECRET: string;
  REFRESH_TOKEN_EXPIRATION: string;
  MONGO_URI: string;
  FRONTEND_URL: string;
  CODE_EXPIRATION: number;
  REDIS_ENABLED: 'true' | 'false';
  REDIS_HOST: string;
  REDIS_PORT: number;
  VAPID_PUBLIC_KEY?: string;
  VAPID_PRIVATE_KEY?: string;
  VAPID_SUBJECT?: string;
}
