import { ConfigFactory } from 'code-config';
import { credential, initializeApp, messaging } from 'firebase-admin';
import { join } from 'path';
import { PATHS } from '../../../shared/constants/paths';

const config = ConfigFactory.getConfig(
  join(PATHS.config, 'firebase.config.json'),
).init();

const object = config.toObject();

initializeApp({
  credential:
    Object.keys(object).length > 0
      ? credential.cert(object)
      : credential.applicationDefault(),
});

export const fcm = messaging();
