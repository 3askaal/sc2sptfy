import { useEffect, useState } from 'react';
import useAxios from 'axios-hooks';

export default function useApi() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<any>(null)

  const [{ data: users = [] }, searchUsers] = useAxios<any>(
    {
      url: `${process.env.NEXT_PUBLIC_API_URL}/sc/users/${searchQuery}`,
      method: 'GET',
    },
    { manual: true }
  )

  const [{ data: favorites }, getFavorites] = useAxios<any>(
    {
      url: `${process.env.NEXT_PUBLIC_API_URL}/sc/likes/${selectedUser?.id}`,
      method: 'GET'
    },
    { manual: true }
  )

  useEffect(() => {
    if (searchQuery.length > 3) {
      searchUsers()
    }
  }, [searchQuery])

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
