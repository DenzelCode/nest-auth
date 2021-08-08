import { Server, ServerOptions } from 'socket.io';
import { SocketIoAdapter } from './socket-io-adapter';

export class CustomSocketIoAdapter extends SocketIoAdapter {
  createIOServer(port: number, options?: ServerOptions) {
    const server = super.createIOServer(port, options) as Server;

    return server;
  }
}
