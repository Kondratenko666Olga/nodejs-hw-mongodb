import * as fs from "node:fs";
import path from "node:path";

import {OAuth2Client} from "google-auth-library";
import {env} from '../utils/env.js';


const CONFIG = JSON.parse(
    fs.readFileSync(path.resolve('src', 'google-oauth-credentials.json'), {
      encoding: 'utf-8',
    }),
  );

const googleOAuth2Client = new OAuth2Client({
    clientId: env("GOOGLE_AUTH_CLIENT_ID"),
    clientSecret: env("GOOGLE_AUTH_CLIENT_SECRET"),
    redirectUri: CONFIG["web"]["redirect_uris"][0]
});

export function generateAuthUrl() {
    return googleOAuth2Client.generateAuthUrl({
        scope: [
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
        ]
    });
}