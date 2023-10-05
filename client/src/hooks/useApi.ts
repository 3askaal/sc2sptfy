import { useRouter } from 'next/router';

export default function useApi() {
  const { query: { code }, replace } = useRouter();

  const searchUsers = () => {}
  const getFavorites = () => {}

  return {
    searchUsers,
    getFavorites
  };
}
