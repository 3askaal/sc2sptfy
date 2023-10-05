import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { sc } from '../../utils';

@Injectable()
export class AppService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async searchUsers(searchQuery: string): Promise<any> {
    return sc.searchUsers(searchQuery);
  }

  async getLikes(userId: string): Promise<any> {
    return sc.getFavorites(userId);
  }
}
