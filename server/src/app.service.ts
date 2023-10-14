import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import promiseSequential from 'promise-sequential';

@Injectable()
export class AppService {
  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async searchUsers(searchQuery: string): Promise<any> {
    const data = await this.get(`users?q=${searchQuery}`);

    return data.map(({ id, username, avatar_url }) => ({
      id,
      username,
      avatar_url,
    }));
  }

  async getFavorites(userId: string): Promise<any> {
    const limit = 1000;

    const favorites = await promiseSequential(
      ['tracks', 'playlists'].map((type) => async () => {
        const items = [];

        let path = `users/${userId}/likes/${type}?linked_partitioning=true&limit=${limit}`;

        while (path) {
          const data = await this.get(path);

          path = data.next_href?.split('https://api.soundcloud.com/')[1];

          items.push(...data.collection);
        }

        return items;
      }),
    );

    return favorites.map(({ kind, title, genre, user, duration }) => ({
      kind,
      title,
      duration,
      ...(genre && {
        genre,
      }),
      user: user.username,
    }));
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

  async post(path: string, payload: any): Promise<any> {
    const accessToken: string =
      (await this.cacheManager.get('accessToken')) ||
      (await this.authenticate());

    const { data } = await firstValueFrom(
      this.httpService
        .post(`${process.env.SC_BASE_URL}/${path}`, payload, {
          headers: {
            Authorization: `OAuth ${accessToken}`,
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            console.error('post: ', error);
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
