import { Socket } from 'socket.io';
import { getSocketClient } from './get-socket-client';

export const getSocketUser = (socket: Socket) => getSocketClient(socket).user;
