import { Server, ServerOptions } from 'socket.io';
import { ExternalSocketIoAdapter } from './external-socket-io-adapter';

export class CustomSocketIoAdapter extends ExternalSocketIoAdapter {
  createIOServer(port: number, options?: ServerOptions) {
    const server = super.createIOServer(port, options) as Server;

    return server;
  }
}
