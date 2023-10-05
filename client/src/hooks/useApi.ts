import useAxios from 'axios-hooks';
import { CONFIG } from '../../config';

export default function useApi() {
  const [{ data: users }, searchUsers] = useAxios<any>(
    {
      url: `${CONFIG.API.BASE_URL}/sc/users`,
      method: 'GET',
    },
    { manual: true }
  )

  const [{ data: favorites }, getFavorites] = useAxios<any>(
    {
      url: `${CONFIG.API.BASE_URL}/sc/likes`,
      method: 'GET'
    },
    { manual: true }
  )

  return {
    users,
    searchUsers,
    favorites,
    getFavorites,
  };
}
