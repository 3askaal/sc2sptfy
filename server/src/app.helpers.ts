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
      .replace(/\s\-\s/g, '')
      // remove unecessary whitespace
      .replace(/\s{2,}/g, ' ')
      // remove starting and ending whitespace
      .trim()
  );
};

export const lc = (value: string) => value.toLowerCase();

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

  const searchQueries = [
    lc(scItem.title),
    `${lc(scItem.user)} ${lc(scItem.title)}`,
    cleanSearchQuery(lc(scItem.title)),
    `${lc(scItem.user)} ${cleanSearchQuery(lc(scItem.title))}`,
  ];

  while (!match && lookupIndex < searchQueries.length) {
    const searchQuery = searchQueries[lookupIndex];

    const [sptfySearchErr, sptfySearchSuccess] = await to(
      sdk.search(searchQuery, ['track']),
    );

    if (sptfySearchErr) {
      console.error('sptfySearchErr: ', sptfySearchErr);
      throw sptfySearchErr;
    }

    if (!sptfySearchSuccess.tracks.items.length) {
      return null;
    }

    const scItemString = lc(JSON.stringify(Object.values(scItem)));

    const matches = sptfySearchSuccess.tracks.items.filter((sptfyItem) => {
      const sptfyItemValues = [
        ...sptfyItem.name.split(' '),
        ...sptfyItem.artists.map(({ name }) => name.split(' ')).flat(),
      ];

      return sptfyItemValues.every((sptfyItemValue) =>
        scItemString.includes(lc(sptfyItemValue)),
      );
    });

    if (matches.length) {
      match = matches[0];
    }

    lookupIndex++;
  }

  return match;
};

export const sptfy = {
  removeAllTracksFromPlaylist,
  findTrack,
};
