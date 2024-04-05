export interface IScFavorite {
  kind: string;
  title: string;
  genre?: string;
  duration: number;
  user: {
    username: string;
  };
}

export interface IFavorite {
  kind: string;
  title: string;
  genre?: string;
  duration: number;
  user: string;
}

export interface IUser {
  id: string;
  username: string;
  avatar: string;
}
