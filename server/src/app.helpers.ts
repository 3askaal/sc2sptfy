import { SpotifyApi } from '@spotify/web-api-ts-sdk';
import to from 'await-to-js';

export const cleanSearchQuery = (searchQuery: string) => {
  return (
    searchQuery
      // remove '[...]'
      .replace(/\[(.*?)\]/g, '')
      // remove '...: '
      .replace(/(.*?)\:\s/g, '')
      // remove ' - '
      .replace(/\s\-\s/g, ' ')
      // remove unecessary whitespace
      .replace(/\s{2,}/g, ' ')
      // remove starting and ending whitespace
      .trim()
      // convert to lowercase
      .toLowerCase()
  );
};

const removeAllTracksFromPlaylist = async (
  sdk: SpotifyApi,
  playlistId: string,
) => {
  let done = false;

  while (!done) {
    const [getPlaylistItemsErr, getPlaylistItemsSuccess] = await to(
      sdk.playlists.getPlaylistItems(playlistId),
    );

    if (getPlaylistItemsErr) {
      throw getPlaylistItemsErr;
    }

    const tracks = getPlaylistItemsSuccess.items.map(({ track: { uri } }) => ({
      uri,
    }));

    if (tracks.length) {
      const [removeItemsFromPlaylistErr] = await to(
        sdk.playlists.removeItemsFromPlaylist(playlistId, { tracks }),
      );

      if (removeItemsFromPlaylistErr) {
        throw removeItemsFromPlaylistErr;
      }
    } else {
      done = true;
    }
  }
};

const findTrack = async (sdk: SpotifyApi, scItem: any) => {
  let match = null;
  let lookupIndex = 0;

  const scItemString = Object.values(scItem).join(' ').toLowerCase();

  const searchQueries = [
    cleanSearchQuery(scItem.title),
    cleanSearchQuery(`${scItem.user} ${scItem.title}`),
  ];

  while (!match && lookupIndex < searchQueries.length) {
    const searchQuery = searchQueries[lookupIndex];

    const [sptfySearchErr, sptfySearchSuccess] = await to(
      sdk.search(searchQuery, ['track'], null, 50),
    );

    if (sptfySearchErr) {
      throw sptfySearchErr;
    }

    if (!sptfySearchSuccess.tracks.items.length) {
      return null;
    }

    match = sptfySearchSuccess.tracks.items.find((sptfyItem) => {
      const nameMatch = scItemString.includes(cleanSearchQuery(sptfyItem.name));
      const artistMatch = sptfyItem.artists.some(({ name }) =>
        scItemString.includes(cleanSearchQuery(name)),
      );

      return nameMatch && artistMatch;
    });

    lookupIndex++;
  }

  return match;
};

export const sptfy = {
  removeAllTracksFromPlaylist,
  findTrack,
};
