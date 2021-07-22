import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { authSecretsConfig } from '../config/auth-secrets.config';

const auth = authSecretsConfig.google;

@Injectable()
export class GoogleAuthService {
  async getUser(accessToken: string) {
    const client = new google.auth.OAuth2(auth.appId as string, auth.appSecret);

    client.setCredentials({ access_token: accessToken });

    const oauth2 = google.oauth2({
      auth: client,
      version: 'v2',
    });

    const { data } = await oauth2.userinfo.get();

    return data;
  }
}
