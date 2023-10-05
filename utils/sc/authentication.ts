import { stringify } from "querystring";
import { to } from "await-to-js";
import fetch from "node-fetch";
import mongoose, { Schema } from 'mongoose';
import { CONFIG } from "../../config";

mongoose.connect('mongodb://127.0.0.1:27017/collabify');

const keysSchema = new Schema({
  key: String,
  createdAt: Date
}, {
  timestamps: true
});

keysSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 });

const Keys = mongoose.model('Keys', keysSchema);

export const getAccessToken = async (code?: string) => {
  const keys = await Keys.find({});
  if (!code && keys.length) return keys[0].key;

  const [getAccessTokenErr, getAccessTokenSuccess] = await to(fetch(`${CONFIG.SC.BASE_URL}/oauth2/token`, {
    method: 'POST',
    headers: {
      'accept': 'application/json; charset=utf-8',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: stringify({
      grant_type: code ? 'authorization_code' : 'client_credentials',
      client_id: CONFIG.SC.CLIENT_ID,
      client_secret: CONFIG.SC.CLIENT_SECRET,
      ...(code && {
        redirect_uri: CONFIG.SC.REDIRECT_URI,
        code
      })
    }),
  }));

  if (getAccessTokenErr) {
    throw getAccessTokenErr;
  }

  const res = await getAccessTokenSuccess!.json() as any;

  await Keys.create({
    key: res.access_token
  })

  return res.access_token;
}
