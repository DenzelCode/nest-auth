import { Socket } from 'socket.io';
import { Client } from './get-client';

export const getSocketUser = (socket: Socket) =>
  ((socket.handshake as unknown) as Client).user;
