import { Dictionary } from 'code-config/dist';
import { config } from 'dotenv';
import { Request } from 'express';
import { Socket } from 'socket.io';
import { Client } from './get-client';

config();

const isProxy = process.env.PROXY_ENABLED === 'true';

const getIp = (ip: string, headers: Client['headers']) => {
  return (
    (!isProxy && ip) || headers['x-forwarded-for'] || headers['x-real-ip'] || ip
  );
};

export const getAddress = (client: Socket | Request): string => {
  if (client instanceof Socket) {
    return getIp(
      client.handshake.address,
      client.handshake.headers as Dictionary,
    );
  }

  return getIp(client.ip, client.headers as Dictionary);
};
