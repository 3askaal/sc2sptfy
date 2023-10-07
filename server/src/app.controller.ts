import { Controller, Get, Param } from '@nestjs/common';
import { SpotifyApi } from '@spotify/web-api-ts-sdk';
import sequential from 'promise-sequential';
import to from 'await-to-js';
import { AppService } from './app.service';
import { CONFIG } from '../config';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('sc/users/:query')
  async getUsers(@Param() params): Promise<any> {
    return this.appService.searchUsers(params.query);
  }

  @Get('generate/:id')
  async generate(@Param() { userId, scUser, accessToken }): Promise<any> {
    const sdk = SpotifyApi.withAccessToken(CONFIG.SPTFY.CLIENT_ID, accessToken);

    const items = (await this.appService.getFavorites(scUser.id))
      .filter(({ kind }) => kind === 'track')
      .filter(({ duration }) => Math.floor(duration / 60000) < 20);

    const tracks = await sequential(
      items.slice(0, 50).map((item) => async () => {
        const [sptfySearchErr, sptfySearchSuccess] = await to(
          sdk.search(item.title, ['track']),
        );

        if (sptfySearchErr) throw sptfySearchErr;

        const stringifiedItem = JSON.stringify(
          Object.values(item),
        ).toLowerCase();

        const matches = sptfySearchSuccess.tracks.items.filter((result) => {
          const criticalValues = [
            result.name,
            ...result.artists.map(({ name }) => name),
          ];

          return criticalValues.every((value) =>
            stringifiedItem.includes(value.toLowerCase()),
          );
        });

        return matches.map(({ id, name, artists }) => ({
          id,
          name,
          artists: artists.map(({ name }) => name),
        }));
      }),
    );

    const tracklist = tracks.map(({ id }) => id);

    const [createPlaylistErr, createPlaylistSuccess] = await to(
      sdk.playlists.createPlaylist(userId, {
        name: scUser.name,
        description: 'Generated with http://sc2sptfy.vercel.app',
        public: false,
      }),
    );

    if (createPlaylistErr) throw createPlaylistErr;

    const spotifyId = createPlaylistSuccess.id;

    const [addItemsToPlaylistErr] = await to(
      sdk.playlists.addItemsToPlaylist(spotifyId, tracklist),
    );

    if (addItemsToPlaylistErr) {
      throw addItemsToPlaylistErr;
    }

    return tracks;
  }
}
