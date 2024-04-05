export interface IItem {
  kind: string;
  title: string;
  genre?: string;
  duration: number;
  user: string;
  artwork_url: string;
}

export interface IUser {
  id: number;
  username: string;
  avatar_url: string;
}
