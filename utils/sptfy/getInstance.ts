import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import { CONFIG } from "../../client/config";

export const getInstance = async (): Promise<SpotifyApi> => {
  return SpotifyApi.withClientCredentials(CONFIG.SPTFY.CLIENT_ID as string, CONFIG.SPTFY.CLIENT_SECRET as string);
};
