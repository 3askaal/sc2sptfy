import { Playlist, SpotifyApi } from "@spotify/web-api-ts-sdk";
import { flatten, times } from 'lodash';
import moment from "moment";
import sequential from 'promise-sequential';

export const getUserPlaylists = async (sdk: SpotifyApi, userId: string) => {
  let playlists: Playlist[] = [];

  let done = false;
  let index = 0;

  while (!done) {
    const res = await sdk.playlists.getUsersPlaylists(userId, 50, index * 50);

    if (res.items.length) {
      const filteredPlaylists = res.items.filter(({ owner, tracks }) => owner.id === userId && tracks.total > 0);
      playlists = [...playlists, ...filteredPlaylists];
      index++;
    } else {
      done = true;
    }
  }

  return playlists.map(({ id }) => id);
}

export const getTracksFromPlaylists = async (sdk: SpotifyApi, playlistIds: string[]) => {
  const items = await sequential(playlistIds.map((playlistId) => async () => {
    const playlist = await sdk.playlists.getPlaylist(playlistId);

    const amountTracks = playlist.tracks.total;
    const amountCalls = Math.ceil(amountTracks / 100);

    const items = await sequential(times(amountCalls, (index) => async () => {
      const { items }: any = await sdk.playlists.getPlaylistItems(playlistId, undefined, undefined, undefined, index * 100);

      return items.map((item) => ({
        ...item,
        playlist: playlist.name
      }));
    }))

    return flatten(items);
  }))

  return flatten(items).map(({ track, playlist, added_at }) => {
    return track && {
      name: track.name,
      artists: track.artists.map(({ name }) => name),
      album: track.album.name,
      date: moment(added_at).format('DD-MM-YYYY'),
      playlist
    }
  })
}

export const getAllTracks = async (sdk: SpotifyApi, userId: string) => {
  const playlistIds = await getUserPlaylists(sdk, userId);
  return getTracksFromPlaylists(sdk, playlistIds);
}
