import { useEffect, useState } from 'react';
import useAxios from 'axios-hooks';
import { useDebounce } from 'usehooks-ts';

export default function useApi() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<any>(null)

  const debouncedSearchQuery = useDebounce<string>(searchQuery, 500)

  let [{ data: users = [] }, searchUsers] = useAxios<any>(
    {
      url: `${process.env.NEXT_PUBLIC_API_URL}/sc/users/${searchQuery}`,
      method: 'GET',
    },
    { manual: true }
  )

  const [{ data: favorites = [] }, getFavorites] = useAxios<any>(
    {
      url: `${process.env.NEXT_PUBLIC_API_URL}/sc/favorites/${selectedUser?.id}`,
      method: 'GET'
    },
    { manual: true }
  )

  useEffect(() => {
    if (debouncedSearchQuery.length <= 3) return;

    searchUsers()
  }, [debouncedSearchQuery])

  useEffect(() => {
    if (!selectedUser) return;

    getFavorites()
  }, [selectedUser])

  useEffect(() => {
    console.log('favorites: ', favorites);
  }, [favorites])

  return {
    users,
    searchUsers,
    favorites,
    getFavorites,
    searchQuery,
    setSearchQuery,
    selectedUser,
    setSelectedUser
  };
}
