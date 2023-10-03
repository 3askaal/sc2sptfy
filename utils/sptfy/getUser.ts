import { SpotifyApi } from "@spotify/web-api-ts-sdk";

export const getUser = async (sdk: SpotifyApi, userId: string) => {
  return sdk.users.profile(userId);
}
