import { INestApplicationContext } from '@nestjs/common';
import { RedisClient } from 'redis';
import { ServerOptions } from 'socket.io';
import { createAdapter, RedisAdapter } from 'socket.io-redis';
import { SocketIoAdapter } from './socket-io-adapter';

export class RedisIoAdapter extends SocketIoAdapter {
  private redisAdapter: RedisAdapter;

  constructor(
    host: string,
    port: number,
    appOrHttpServer?: INestApplicationContext | any,
    corsOrigins: string | string[] = '*',
  ) {
    super(appOrHttpServer, corsOrigins);

    const pubClient = new RedisClient({ host, port });
    const subClient = pubClient.duplicate();
    this.redisAdapter = createAdapter({ pubClient, subClient });
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);

    server.adapter(this.redisAdapter);

    return server;
  }
}
