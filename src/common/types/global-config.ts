export interface GlobalConfig {
  PORT: number;
  ACCESS_TOKEN_SECRET: string;
  ACCESS_TOKEN_EXPIRATION: string;
  REFRESH_TOKEN_SECRET: string;
  REFRESH_TOKEN_EXPIRATION: string;
  MONGO_URI: string;
  FRONTEND_URL: string;
  CODE_EXPIRATION: number;
}
