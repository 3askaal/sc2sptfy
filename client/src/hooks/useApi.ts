import { useContext, useEffect, useState } from 'react';
import useAxios from 'axios-hooks';
import { useDebounce, useInterval } from 'usehooks-ts';
import useSpotify from './useSpotify';

export default function useApi() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const { accessToken } = useSpotify()

  let [{ data: users = [] }, searchUsers] = useAxios<any>(
    {
      url: `${process.env.NEXT_PUBLIC_API_URL}/users/${searchQuery}`,
      method: 'GET',
    },
    { manual: true }
  )

  const [{ data: generateProcessId }, generate] = useAxios<any>(
    {
      url: `${process.env.NEXT_PUBLIC_API_URL}/generate`,
      method: 'POST'
    },
    { manual: true }
  )

  const [{ data: generateStatus }, status] = useAxios<any>(
    {
      url: `${process.env.NEXT_PUBLIC_API_URL}/generate/${selectedUser?.id}/status`,
      method: 'POST'
    },
    { manual: true }
  )

  const debouncedSearchQuery = useDebounce<string>(searchQuery, 500)

  useEffect(() => {
    if (debouncedSearchQuery.length <= 3) return;

    searchUsers()
  }, [debouncedSearchQuery])

  useEffect(() => {
    if (!selectedUser) return;

    generate({
      data: {
        user: selectedUser,
        accessToken
      }
    })
  }, [selectedUser])

  useInterval(() => {
    status();
  }, generateProcessId && generateStatus !== 100 ? 3000 : null);

  return {
    users,
    searchUsers,
    generate,
    searchQuery,
    setSearchQuery,
    selectedUser,
    setSelectedUser,
    generateStatus
  };
}
