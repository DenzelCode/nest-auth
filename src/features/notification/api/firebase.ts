import { initializeApp, messaging } from 'firebase-admin';

initializeApp();

export const fcm = messaging();
