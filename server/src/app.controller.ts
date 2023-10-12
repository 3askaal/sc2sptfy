import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SpotifyApi } from '@spotify/web-api-ts-sdk';
import sequential from 'promise-sequential';
import to from 'await-to-js';
import { AppService } from './app.service';
import { CONFIG } from '../config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DocumentDocument } from './app.schema';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectModel(Document.name) private documentModel: Model<DocumentDocument>,
  ) {}

  @Get('users/:query')
  async getUsers(@Param() params): Promise<any> {
    return this.appService.searchUsers(params.query);
  }

  @Post('generate')
  async generate(@Body() { user, accessToken }): Promise<any> {
    const sdk = SpotifyApi.withAccessToken(CONFIG.SPTFY.CLIENT_ID, accessToken);
    const currentUser = await sdk.currentUser.profile();

    const scItems = (await this.appService.getFavorites(user.id))
      .filter(({ kind }) => kind === 'track')
      .filter(({ duration }) => Math.floor(duration / 60000) < 20)
      .slice(0, 50);

    const doc = await this.documentModel.create({
      sptfyUser: currentUser.id,
      scUser: user.id,
      amount: scItems.length,
      status: 0,
    });

    const tracks = await sequential(
      scItems.map((scItem, index: number) => async () => {
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

        await this.documentModel.findByIdAndUpdate(doc.id, {
          status: Math.floor(index / scItems.length) * 100,
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
      sdk.playlists.createPlaylist(currentUser.id, {
        name: user.name,
        description: 'Generated with http://sc2sptfy.vercel.app',
        public: false,
      }),
    );

    if (createPlaylistErr) throw createPlaylistErr;

    const [addItemsToPlaylistErr] = await to(
      sdk.playlists.addItemsToPlaylist(createPlaylistSuccess.id, tracklist),
    );

    if (addItemsToPlaylistErr) throw addItemsToPlaylistErr;

    return doc.id;
  }

  @Get('generate/:id/status')
  async status(@Param() { id }): Promise<any> {
    return (await this.documentModel.findById(id)).status;
  }
}
