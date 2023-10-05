import { useRouter } from 'next/router';

export default function useApi() {
  const { query: { code }, replace } = useRouter();

  const searchUsers = () => {}
  const getLikes = () => {}

  return {
    searchUsers,
    getLikes
  };
}
