import { Request } from 'express';

export const getURL = (request: Request) => {
  return request.protocol + '://' + request.get('host');
};
