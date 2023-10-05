import { request } from "./request";
import { getUser } from "./users";

const limit = 1000;

const getFavoritesBy = async (userId: string, type: string) => {
  let href = `users/${userId}/likes/${type}?linked_partitioning=true&limit=${limit}`;

  const likes: any = [];

  while (href) {
    const [err, success] = await request(href);

    if (err) {
      throw err;
    }

    const res = await success.json() as any;

    href = res.next_href && res.next_href.split('https://api.soundcloud.com/')[1];

    likes.push(...res.collection)
  }

  return likes;
}

export const getFavorites = async (permalink: string) => {
  const profile = await getUser(permalink);

  let favorites: any = [];

  const tracks = await getFavoritesBy(profile.id, 'tracks')
  const playlists = await getFavoritesBy(profile.id, 'playlists')

  favorites = [...favorites, ...tracks]
  favorites = [...favorites, ...playlists]

  return favorites.map(({ kind, title, genre, user }) => ({
    kind,
    title,
    ...(genre && {
      genre
    }),
    user: user.username,
  }))
}
