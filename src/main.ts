import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SocketIoAdapter } from './core/adapter/socket-io-adapter';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useWebSocketAdapter(new SocketIoAdapter(app));

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  await app.listen(3000);
}

bootstrap();
