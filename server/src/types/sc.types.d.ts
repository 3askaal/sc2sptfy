export interface IScUser {
  id: number;
  uri: string;
  permalink: string;
  username: string;
  first_name: string;
  last_name: string;
  full_name: string;
  permalink_url: string;
  avatar_url: string;
  city: string;
  country: string | null;
  description: string;
  kind: string;
  track_count: number;
  public_favorites_count: number;
  reposts_count: number;
  followers_count: number;
  followings_count: number;
  comments_count: number;
  playlist_count: number;
  created_at: string;
  last_modified: string;
}

export interface IScFavorite {
  id: number;
  uri: string;
  kind: 'track' | 'playlist';
  title: string;
  description: string;
  genre: string;
  tag_list: string;
  duration: number;
  release: string;
  release_year: null;
  release_month: null;
  release_day: null;
  label_name: string;
  user: IScUser;
  permalink_url: string;
  playback_count: number;
  favoritings_count: number;
  reposts_count: number;
  comment_count: number;
  download_count: number;
  created_at: string;
}

export type IScRes<N> = {
  collection: N[];
  next_href: null | string;
};
