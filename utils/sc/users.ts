import { request } from "./request";

export const getUser = async (userName: string) => {
  const [err, success] = await request(`users?q=${userName}`);

  if (err) {
    throw err;
  }

  const res = await success.json() as any;

  const user = res.find(({ permalink }) => permalink === userName)

  if (!user) {
    throw new Error(`User not found: ${userName}`);
  }

  return user;
}

export const searchUsers = async (searchQuery: string) => {
  const [err, success] = await request(`users?q=${searchQuery}`);

  if (err) {
    throw err;
  }

  return success.json() as any;
}
