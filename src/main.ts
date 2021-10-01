import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RedisIoAdapter } from './core/adapter/redis-io.adapter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { environments } from './environments/environments';
import { CustomSocketIoAdapter } from './core/adapter/custom-socket-io.adapter';

const redis = environments.redis;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors();
  app.enableShutdownHooks();
  app.set('trust proxy', environments.proxyEnabled);

  if (redis.enabled) {
    app.useWebSocketAdapter(new RedisIoAdapter(redis.host, redis.port, app));
  } else {
    app.useWebSocketAdapter(new CustomSocketIoAdapter(app));
  }

  const port = environments.port;
  const logger = new Logger('NestApplication');

  await app.listen(port, () =>
    logger.log(`Server initialized on port ${port}`),
  );
}

bootstrap();
