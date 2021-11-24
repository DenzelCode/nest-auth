import { ConfigFactory } from 'code-config';
import { credential, initializeApp, messaging } from 'firebase-admin';
import { join } from 'path';
import { PATHS } from '../../../shared/constants/paths';

const config = ConfigFactory.getConfig(
  join(PATHS.config, 'firebase.config.json'),
).init();

const validConfig = Object.keys(config.toObject()).length > 0 ? credential.cert(config.toObject()) : credential.applicationDefault()

initializeApp({
  credential: validConfig,
});

export const fcm = messaging();
