import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import promiseSequential from 'promise-sequential';
import { IScRes, IScUser, IScItem, IUser, IItem } from './types';
import to from 'await-to-js';
import { flatten } from 'lodash';

@Injectable()
export class AppService {
  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async searchUsers(searchQuery: string): Promise<IUser[]> {
    const data: IScUser[] = await this.get(`users?q=${searchQuery}`);

    return data.map(({ id, username, avatar_url }) => ({
      id,
      username,
      avatar_url,
    }));
  }

  async getUserData(userId: string): Promise<any> {
    const [getLikesError, getLikesSuccess] = await to(this.getLikes(userId));

    if (getLikesError) {
      throw getLikesError;
    }
    const [getPlaylistsError, getPlaylistsSuccess] = await to(
      this.getPlaylists(userId),
    );

    if (getPlaylistsError) {
      throw getPlaylistsError;
    }
    const [getTracksError, getTracksSuccess] = await to(this.getTracks(userId));

    if (getTracksError) {
      throw getTracksError;
    }

    return {
      likes: getLikesSuccess,
      playlists: getPlaylistsSuccess,
      tracks: getTracksSuccess,
    };
  }

  formatItems(items: IScItem[]): IItem[] {
    return items
      .filter(({ kind }) => kind === 'track')
      .filter(({ duration }) => Math.floor(duration / 60000) < 20)
      .map(({ kind, title, genre, user, duration, artwork_url }) => ({
        kind,
        title,
        duration,
        ...(genre && {
          genre,
        }),
        user: user.username,
        artwork_url,
      }));
  }

  async getPlaylists(userId: string): Promise<any[]> {
    return this.get(`users/${userId}/playlists`);
  }

  async getSelectedPlaylistTracks(userId: string, playlistSelection: any) {
    const [getPlaylistsError, getPlaylistsSuccess] = await to(
      this.getPlaylists(userId),
    );

    if (getPlaylistsError) {
      console.error('getPlaylistsError: ', getPlaylistsError);
      throw getPlaylistsError;
    }

    return this.formatItems(
      flatten(
        getPlaylistsSuccess
          .filter(({ id }) => playlistSelection[id])
          .map(({ tracks }) => tracks),
      ),
    );
  }

  async getTracks(userId: string): Promise<IItem[]> {
    const tracks = await this.get(`users/${userId}/tracks`);

    return this.formatItems(tracks);
  }

  async getLikes(
    userId: string,
    limit = 1000,
    paginate = true,
  ): Promise<IItem[]> {
    const likes: IScItem[] = await promiseSequential(
      ['tracks', 'playlists'].map((type) => async () => {
        const items = [];

        let path = `users/${userId}/likes/${type}?linked_partitioning=true&limit=${limit}`;

        while (path) {
          const data: IScRes<IScItem> = await this.get(path);

          items.push(...data.collection);

          path = paginate
            ? data.next_href?.split('https://api.soundcloud.com/')[1]
            : null;
        }

        return items;
      }),
    );

    return this.formatItems(likes);
  }

  async get(path: string): Promise<any> {
    const accessToken: string =
      (await this.cacheManager.get('accessToken')) ||
      (await this.authenticate());

    const { data } = await firstValueFrom(
      this.httpService
        .get(`${process.env.SC_BASE_URL}/${path}`, {
          headers: {
            Authorization: `OAuth ${accessToken}`,
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            console.error('get: ', error);
            throw error;
          }),
        ),
    );

    return data;
  }

  async authenticate(): Promise<any> {
    const { data } = await firstValueFrom(
      this.httpService
        .post(
          `${process.env.SC_BASE_URL}/oauth2/token`,
          {
            grant_type: 'client_credentials',
            client_id: process.env.SC_CLIENT_ID,
            client_secret: process.env.SC_CLIENT_SECRET,
          },
          {
            headers: {
              accept: 'application/json; charset=utf-8',
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            console.error('auth: ', error);
            throw error;
          }),
        ),
    );

    const accessToken = data.access_token;

    await this.cacheManager.set('accessToken', accessToken, 3600 * 1000);

    return accessToken;
  }
}
