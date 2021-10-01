import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, ServerOptions } from 'socket.io';
import { getAddress } from '../../shared/utils/get-address';

export class CustomSocketIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: ServerOptions) {
    const server = super.createIOServer(port, options) as Server;

    server.use((socket, next) => {
      socket.handshake.address = getAddress(socket);

      next();
    });

    return server;
  }
}
