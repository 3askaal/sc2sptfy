import {
  Processor,
  Process,
  OnQueueCompleted,
  OnQueueActive,
  OnQueueFailed,
} from '@nestjs/bull';
import { Job } from 'bull';
import to from 'await-to-js';
import sequential from 'promise-sequential';
import { Playlist, SpotifyApi } from '@spotify/web-api-ts-sdk';
import { AppService } from './app.service';
import { sptfy } from './app.helpers';
import { InjectModel } from '@nestjs/mongoose';
import { Generation } from './app.schema';
import { Model } from 'mongoose';

const logMeta = ({ scUser, sptfyUser }) => {
  return `(from: ${scUser?.username || ''} to: ${
    sptfyUser?.display_name || ''
  })`;
};

@Processor('generation')
export class AppConsumer {
  constructor(
    private readonly appService: AppService,
    @InjectModel(Generation.name) private generationModel: Model<Generation>,
  ) {}

  @Process()
  async generate(job: Job<any>) {
    const { scUser, sptfyUser, selection, accessToken, docId } = job.data;

    await this.generationModel.findByIdAndUpdate(docId, {
      status: 'active',
      jobId: job.id,
    });

    let newData = { ...job.data };

    const sdk = SpotifyApi.withAccessToken(
      process.env.SPTFY_CLIENT_ID,
      accessToken,
    );

    let playlistId = null;

    const isProd = process.env.NODE_ENV === 'production';

    // Creates new playlist in production
    // Re-uses fixed playlist in development for debugging purpose
    const [createOrUpdatePlaylistErr, createOrUpdatePlaylistSuccess] = await to(
      sdk.playlists[isProd ? 'createPlaylist' : 'changePlaylistDetails'](
        isProd ? sptfyUser.id : process.env.DEBUG_SPTFY_PLAYLIST_ID,
        {
          name: `sc2sptfy - ${scUser.username}`,
          description: 'Generated with https://sc2sptfy.vercel.app',
          public: false,
        },
      ) as Promise<Playlist | void>,
    );

    if (createOrUpdatePlaylistErr) {
      console.error('createOrUpdatePlaylistErr: ', createOrUpdatePlaylistErr);
      throw createOrUpdatePlaylistErr;
    }

    playlistId =
      (createOrUpdatePlaylistSuccess as any)?.id ||
      process.env.DEBUG_SPTFY_PLAYLIST_ID;

    // Cleans up playlist used for debugging in development
    if (!isProd) {
      await sptfy.removeAllTracksFromPlaylist(sdk, playlistId);
    }

    const scItems = [];

    if (selection.tracks) {
      const [getTracksError, getTracksSuccess] = await to(
        this.appService.getTracks(scUser.id),
      );

      if (getTracksError) {
        console.error('getTracksError: ', getTracksError);
        throw getTracksError;
      }

      scItems.push(...getTracksSuccess);
    }

    if (Object.values(selection.playlists).some((value) => value)) {
      const [getPlaylistItemsError, getPlaylistItemsSuccess] = await to(
        this.appService.getSelectedPlaylistTracks(
          scUser.id,
          selection.playlists,
        ),
      );

      if (getPlaylistItemsError) {
        console.error('getPlaylistItemsError: ', getPlaylistItemsError);
        throw getPlaylistItemsError;
      }

      scItems.push(...getPlaylistItemsSuccess);
    }

    if (selection.likes) {
      const [getLikesErr, getLikesSuccess] = await to(
        this.appService.getLikes(scUser.id),
      );

      if (getLikesErr) {
        console.error('getLikesErr: ', getLikesErr);
        throw getLikesErr;
      }

      scItems.push(...getLikesSuccess);
    }

    newData = {
      ...newData,
      totalItems: scItems.length,
      currentItem: 0,
      matchCount: 0,
      accuracy: 0,
    };

    await job.update(newData);

    let tempMatches: string[] = [];

    const [mapSpotifyItemsErrors] = await to(
      sequential(
        scItems.map((scItem, index: number) => async () => {
          const progress = Math.floor((index / scItems.length) * 95);
          await job.progress(progress);

          const match = await sptfy.findTrack(sdk, scItem);

          if (match?.uri) {
            tempMatches.push(match?.uri);
          }

          if (tempMatches.length === 50 || index === scItems.length - 1) {
            const [addTrackToPlaylistErr] = await to(
              sdk.playlists.addItemsToPlaylist(playlistId, tempMatches),
            );

            if (addTrackToPlaylistErr) {
              console.error('addTrackToPlaylistErr: ', addTrackToPlaylistErr);
              throw addTrackToPlaylistErr;
            }

            tempMatches = [];
          }

          const currentItem = index + 1;
          const matchCount = newData.matchCount + (match ? 1 : 0);
          const accuracy = Math.round((matchCount / currentItem) * 100);

          newData = {
            ...newData,
            currentItem,
            matchCount,
            accuracy,
          };

          await job.update(newData);

          return match?.uri;
        }),
      ),
    );

    if (mapSpotifyItemsErrors) {
      console.error('mapSpotifyItemsErrors: ', mapSpotifyItemsErrors);
      throw mapSpotifyItemsErrors;
    }

    await job.update({ ...job.data, playlistId });

    await job.progress(100);

    await this.generationModel.findByIdAndUpdate(docId, {
      status: 'completed',
    });
  }

  @OnQueueActive()
  onActive(job: Job) {
    console.log('Generation started!', logMeta(job.data));
  }

  @OnQueueCompleted()
  onCompleted(job: Job) {
    console.log('Generation completed!', logMeta(job.data));
  }

  @OnQueueFailed()
  onFailed(job: Job) {
    console.log(
      `Generation failed at ${job.progress()}% because of: ${job.failedReason}`,
      logMeta(job.data),
    );
  }
}
