import { Socket } from 'socket.io';
import { Client } from './get-client';

export const getSocketClient = (socket: Socket) =>
  (socket.handshake as unknown) as Client;
