import { INestApplicationContext } from '@nestjs/common';
import { RedisClient } from 'redis';
import { ServerOptions } from 'socket.io';
import { createAdapter, RedisAdapter } from 'socket.io-redis';
import { CustomSocketIoAdapter } from './custom-socket-io.adapter';

export class RedisIoAdapter extends CustomSocketIoAdapter {
  private redisAdapter: RedisAdapter;

  constructor(host: string, port: number, app: INestApplicationContext) {
    super(app);

    const pubClient = new RedisClient({ host, port });
    const subClient = pubClient.duplicate();
    this.redisAdapter = createAdapter({ pubClient, subClient });
  }

  createIOServer(port: number, options?: ServerOptions) {
    const server = super.createIOServer(port, options);

    server.adapter(this.redisAdapter as any);

    return server;
  }
}
