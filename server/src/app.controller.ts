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

    const scItems = (await this.appService.getFavorites(scUser.id))
      .filter(({ kind }) => kind === 'track')
      .filter(({ duration }) => Math.floor(duration / 60000) < 20);

    const tracks = await sequential(
      scItems.slice(0, 50).map((scItem) => async () => {
        const [sptfySearchErr, sptfySearchSuccess] = await to(
          sdk.search(scItem.title, ['track']),
        );

        if (sptfySearchErr) throw sptfySearchErr;

        const scItemString = JSON.stringify(
          Object.values(scItem),
        ).toLowerCase();

        const matches = sptfySearchSuccess.tracks.items.filter((sptfyItem) => {
          const sptfyItemValues = [
            sptfyItem.name,
            ...sptfyItem.artists.map(({ name }) => name),
          ];

          return sptfyItemValues.every((sptfyItemValue) =>
            scItemString.includes(sptfyItemValue.toLowerCase()),
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

    const [addItemsToPlaylistErr] = await to(
      sdk.playlists.addItemsToPlaylist(createPlaylistSuccess.id, tracklist),
    );

    if (addItemsToPlaylistErr) throw addItemsToPlaylistErr;

    return tracks;
  }
}
