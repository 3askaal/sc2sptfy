import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { HttpService } from '@nestjs/axios';
import sequential from 'promise-sequential';
import { CONFIG } from '../../config';

@Injectable()
export class AppService {
  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async searchUsers(searchQuery: string): Promise<any> {
    return this.get(`users?q=${searchQuery}`);
  }

  async getFavorites(userId: string): Promise<any> {
    const favorites = await sequential(
      ['tracks', 'playlists'].map((type) => async () => {
        const items = [];

        let path = `users/${userId}/likes/${type}?linked_partitioning=true&limit=${limit}`;

        while (path) {
          const [err, success] = await this.get(path);

          if (err) {
            throw err;
          }

          path =
            success.next_href &&
            success.next_href.split('https://api.soundcloud.com/')[1];

          items.push(...success.collection);
        }

        return items;
      }),
    );

    return favorites.map(({ kind, title, genre, user }) => ({
      kind,
      title,
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

    return this.httpService.get(`${CONFIG.SC.BASE_URL}/${path}`, {
      headers: {
        Authorization: `OAuth ${accessToken}`,
      },
    });
  }

  async post(path: string, payload: any): Promise<any> {
    const accessToken: string =
      (await this.cacheManager.get('accessToken')) ||
      (await this.authenticate());

    return this.httpService.post(`${CONFIG.SC.BASE_URL}/${path}`, payload, {
      headers: {
        Authorization: `OAuth ${accessToken}`,
      },
    });
  }

  async authenticate(): Promise<any> {
    const res = await this.post('oauth2/token', {
      grant_type: 'client_credentials',
      client_id: CONFIG.SC.CLIENT_ID,
      client_secret: CONFIG.SC.CLIENT_SECRET,
    });

    const accessToken = res.access_token;

    await this.cacheManager.set('accessToken', accessToken, 3600 * 1000);

    return accessToken;
  }
}
