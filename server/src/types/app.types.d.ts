export interface IFavorite {
  kind: string;
  title: string;
  genre?: string;
  duration: number;
  user: string;
}

export interface IUser {
  id: number;
  username: string;
  avatar: string;
}
