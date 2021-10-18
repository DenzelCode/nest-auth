import { ConfigFactory } from 'code-config';
import { credential, initializeApp, messaging } from 'firebase-admin';
import { join } from 'path';
import { PATHS } from '../../../shared/constants/paths';

const config = ConfigFactory.getConfig(
  join(PATHS.config, 'firebase.config.json'),
).init();

initializeApp({
  credential: credential.cert(config.toObject()),
});

export const fcm = messaging();
