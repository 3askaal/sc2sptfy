import { to } from "await-to-js"
import fetch, { RequestInit } from 'node-fetch';
import { getAccessToken } from "./authentication";
import { CONFIG } from "../../client/config";

export const request = async (path: string, options?: RequestInit, code?: string) => {
  const accessToken = await getAccessToken(code);

  return to(fetch(`${CONFIG.SC.BASE_URL}/${path}`, {
    headers: {
      'Authorization': `OAuth ${accessToken}`,
      ...options?.headers,
    },
    ...options
  }));
}
