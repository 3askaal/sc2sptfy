import { request } from "./request";
import { getUser } from "./users";

const limit = 1000;

const getFollowings = async (userId: string) => {
  let href = `users/${userId}/followings?linked_partitioning=true&limit=${limit}`;

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

export const getFollowing = async (permalink: string) => {
  const profile = await getUser(permalink);

  const followings = await getFollowings(profile.id)

  console.log('followings: ', followings);

  // return followings.map(({ kind, title, genre, user }) => ({
  //   kind,
  //   title,
  //   ...(genre && {
  //     genre
  //   }),
  //   user: user.username,
  // }))

  return null;
}
