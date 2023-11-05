import {
  Processor,
  Process,
  OnQueueCompleted,
  OnQueueActive,
  OnQueueFailed,
  OnQueueProgress,
} from '@nestjs/bull';
import { Job } from 'bull';
import { SpotifyApi } from '@spotify/web-api-ts-sdk';
import { AppService } from './app.service';
import sequential from 'promise-sequential';
import to from 'await-to-js';
import { chunk } from 'lodash';

const logMeta = ({ scUser, sptfyUser }) => {
  return `(from: ${scUser?.username || ''} to: ${
    sptfyUser?.display_name || ''
  })`;
};

const lc = (value: string) => value.toLowerCase();

const findMatch = async (sdk: SpotifyApi, scItem: any, searchQuery: string) => {
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
      lc(sptfyItem.name),
      ...sptfyItem.artists.map(({ name }) => lc(name)),
    ];

    return sptfyItemValues.every((sptfyItemValue) =>
      scItemString.includes(sptfyItemValue),
    );
  });

  return matches.length ? matches[0] : null;
};

@Processor('generation')
export class AppConsumer {
  constructor(private readonly appService: AppService) {}

  @Process()
  async generate(job: Job<any>) {
    const { scUser, accessToken } = job.data;

    const sdk = SpotifyApi.withAccessToken(
      process.env.SPTFY_CLIENT_ID,
      accessToken,
    );

    const [getProfileErr, getProfileSuccess] = await to(
      sdk.currentUser.profile(),
    );

    if (getProfileErr) {
      console.error('getProfileErr: ', getProfileErr);
      throw getProfileErr;
    }

    const currentUser = getProfileSuccess;

    await job.update({ ...job.data, sptfyUser: currentUser });

    const [getFavoritesErr, getFavoritesSuccess] = await to(
      this.appService.getFavorites(scUser.id),
    );

    if (getFavoritesErr) {
      console.error('getFavoritesErr: ', getFavoritesErr);
      throw getFavoritesErr;
    }

    const scItems = getFavoritesSuccess
      .filter(({ kind }) => kind === 'track')
      .filter(({ duration }) => Math.floor(duration / 60000) < 20);

    const [mapSpotifyItemsErrors, mapSpotifyItemsSuccess] = await to(
      sequential(
        scItems.map((scItem, index: number) => async () => {
          const progress = Math.floor((index / scItems.length) * 95);
          await job.progress(progress);

          const searchQueries = [
            lc(scItem.title),
            `${lc(scItem.user)} ${lc(scItem.title)}`,
          ];

          let match = null;
          let lookupIndex = 0;

          while (!match && lookupIndex < searchQueries.length) {
            match = await findMatch(sdk, scItem, searchQueries[lookupIndex]);
            lookupIndex++;
          }

          return match?.uri;
        }),
      ),
    );

    if (mapSpotifyItemsErrors) {
      console.error('mapSpotifyItemsErrors: ', mapSpotifyItemsErrors);
      throw mapSpotifyItemsErrors;
    }

    const trackIds = mapSpotifyItemsSuccess.filter((value) => !!value);

    const [createPlaylistErr, createPlaylistSuccess] = await to(
      sdk.playlists.createPlaylist(currentUser.id, {
        name: scUser.username,
        description: 'Generated with http://sc2sptfy.vercel.app',
        public: false,
      }),
    );

    if (createPlaylistErr) {
      console.error('createPlaylistErr: ', createPlaylistErr);
      throw createPlaylistErr;
    }

    const [addItemsToPlaylistErr] = await to(
      sequential(
        chunk(trackIds, 100).map((trackIdChunk) => async () => {
          const [addChunkToPlaylistErr] = await to(
            sdk.playlists.addItemsToPlaylist(
              createPlaylistSuccess.id,
              trackIdChunk,
            ),
          );

          if (addChunkToPlaylistErr) {
            console.error('addChunkToPlaylistErr: ', addChunkToPlaylistErr);
            throw addChunkToPlaylistErr;
          }
        }),
      ),
    );

    if (addItemsToPlaylistErr) {
      console.error('addItemsToPlaylistErr: ', addItemsToPlaylistErr);
      throw addItemsToPlaylistErr;
    }

    await job.progress(100);

    job.update({ ...job.data, playlist: createPlaylistSuccess });
  }

  @OnQueueActive()
  onActive(job: Job) {
    console.log('Generation started!', logMeta(job.data));
  }

  @OnQueueProgress()
  onProgress(job: Job) {
    console.log('Generation progress: ', job.progress(), logMeta(job.data));
  }

  @OnQueueCompleted()
  onCompleted(job: Job) {
    console.log('Generation completed!', logMeta(job.data));
  }

  @OnQueueFailed()
  onFailed(job: Job) {
    console.log('Generation failed!', job.failedReason, logMeta(job.data));
  }
}
