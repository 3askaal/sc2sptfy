import { useContext, useEffect, useState } from 'react';
import useAxios from 'axios-hooks';
import { useDebounce } from 'usehooks-ts';
import useSpotify from './useSpotify';

export default function useApi() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [generationStatus, setGenerationStatus] = useState<number | null>(null)
  const { accessToken } = useSpotify()

  const debouncedSearchQuery = useDebounce<string>(searchQuery, 500)

  let [{ data: users = [] }, searchUsers] = useAxios<any>(
    {
      url: `${process.env.NEXT_PUBLIC_API_URL}/sc/users/${searchQuery}`,
      method: 'GET',
    },
    { manual: true }
  )

  const [{ data: generateRes = [] }, generate] = useAxios<any>(
    {
      url: `${process.env.NEXT_PUBLIC_API_URL}/generate`,
      method: 'POST'
    },
    { manual: true }
  )

  const [{ data: statusRes = [] }, status] = useAxios<any>(
    {
      url: `${process.env.NEXT_PUBLIC_API_URL}/generate/${selectedUser?.id}/status`,
      method: 'POST'
    },
    { manual: true }
  )

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

    setIsGenerating(true)
  }, [selectedUser])

  useEffect(() => {
    if (!isGenerating) return;

  }, [isGenerating])

  useEffect(() => {
    console.log('generateRes: ', generateRes);
  }, [generateRes])

  return {
    users,
    searchUsers,
    generate,
    searchQuery,
    setSearchQuery,
    selectedUser,
    setSelectedUser
  };
}
