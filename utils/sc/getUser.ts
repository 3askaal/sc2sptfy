import { request } from "./request";

export const getUser = async (userName: string) => {
  const [err, success] = await request(`users?q=${userName}`);

  if (err) {
    throw err;
  }

  const res = await success.json() as any;

  const user = res.find(({ permalink }) => permalink === userName)

  return user;
}
