import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';
import promiseSequential from 'promise-sequential';
import { CONFIG } from 'config';
import { SpotifyApi } from '@spotify/web-api-ts-sdk';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('sc/users/:query')
  async getUsers(@Param() params): Promise<any> {
    return this.appService.searchUsers(params.query);
  }

  @Get('generate/:id')
  async generate(@Param() params): Promise<any> {
    const sdk = SpotifyApi.withClientCredentials(
      CONFIG.SPTFY.CLIENT_ID as string,
      CONFIG.SPTFY.CLIENT_SECRET as string,
    );

    const items = (await this.appService.getFavorites(params.id))
      .filter(({ kind }) => kind === 'track')
      .filter(({ duration }) => Math.floor(duration / 60000) < 20);

    const tracks = await promiseSequential(
      items.slice(0, 5).map((item) => async () => {
        const title = item.title;

        console.log('title: ', title);

        const results = await sdk.search(title, ['track']);

        console.log('results: ', results.tracks.items.length);

        const stringifiedItem = JSON.stringify(
          Object.values(item),
        ).toLowerCase();

        const matches = results.tracks.items.filter((result) => {
          const criticalValues = [
            result.name,
            ...result.artists.map(({ name }) => name),
          ];

          return criticalValues.every((value) =>
            stringifiedItem.includes(value.toLowerCase()),
          );
        });

        console.log('matches: ', matches.length);

        return matches.map(({ id, name, artists }) => ({
          id,
          name,
          artists: artists.map(({ name }) => name),
        }));
      }),
    );

    return tracks;
  }
}
