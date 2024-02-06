import { SpotifyApi } from '@spotify/web-api-ts-sdk';
import to from 'await-to-js';
import { maxBy } from 'lodash';
import similarity from 'similarity';

export const cleanSearchQuery = (searchQuery: string) => {
  return (
    searchQuery
      // remove '[...]'
      .replace(/\[(.*?)\]/g, '')
      // remove '...: '
      .replace(/(.*?)\:\s/g, '')
      // remove ' - '
      .replace(/\s\-\s/g, ' s')
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
    cleanSearchQuery(lc(scItem.title)),
    `${lc(scItem.user)} ${cleanSearchQuery(lc(scItem.title))}`,
    lc(scItem.title),
    `${lc(scItem.user)} ${lc(scItem.title)}`,
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

    // const scItemString = [scItem.title, scItem.user].join(' ');

    const rankedResults = sptfySearchSuccess.tracks.items.map((sptfyItem) => {
      const sptfyItemStr = [
        sptfyItem.name,
        ...sptfyItem.artists.map(({ name }) => name),
      ].join(' ');

      const similar = similarity(sptfyItemStr, searchQuery, {
        sensitive: false,
      });

      console.log('sptfy: ', sptfyItemStr);
      console.log('sc: ', searchQuery);
      console.log('match: ', similar);
      console.log('#######################');
      console.log('#######################');
      console.log('#######################');

      return {
        ...sptfyItem,
        similarity: similar,
      };
    });

    const potentialMatch = maxBy(rankedResults, 'similar');

    if (potentialMatch.similarity > 0.75) {
      match = potentialMatch;
    }

    lookupIndex++;
  }

  return match;
};

export const sptfy = {
  removeAllTracksFromPlaylist,
  findTrack,
};
