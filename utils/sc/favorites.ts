import { request } from "./request";
import { getUser } from "./users";

const limit = 1000;

const getLikesBy = async (userId: string, type: string) => {
  let href = `users/${userId}/likes/${type}?linked_partitioning=true&limit=${limit}`;

  const likes: any = [];

  while (href) {
    const [getLikesByErr, getLikesBySuccess] = await request(href);

    if (getLikesByErr) {
      console.log('getLikesByErr: ', getLikesByErr);
      href = '';
      return;
    }

    const res = await getLikesBySuccess.json() as any;

    href = res.next_href && res.next_href.split('https://api.soundcloud.com/')[1];

    likes.push(...res.collection)
  }

  return likes;
}

export const getLikes = async (permalink: string) => {
  const profile = await getUser(permalink);

  let favorites: any = [];

  const tracks = await getLikesBy(profile.id, 'tracks')
  const playlists = await getLikesBy(profile.id, 'playlists')

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
