import { Dictionary } from 'code-config/dist';
import { config } from 'dotenv';
import { Request } from 'express';
import { Socket } from 'socket.io';
import { Client } from './get-client';

config();

const getAddressFrom = (ip: string, headers: Client['headers']) => {
  const isProxy = process.env.PROXY_ENABLED === 'true';

  return (
    (!isProxy && ip) || headers['x-forwarded-for'] || headers['x-real-ip'] || ip
  );
};

export const getAddress = (client: Socket | Request): string => {
  if (client instanceof Socket) {
    return getAddressFrom(
      client.handshake.address,
      client.handshake.headers as Dictionary,
    );
  }

  return getAddressFrom(client.ip, client.headers as Dictionary);
};
