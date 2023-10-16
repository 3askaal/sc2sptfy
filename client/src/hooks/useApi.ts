import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import useAxios from 'axios-hooks';
import { useDebounce, useInterval } from 'usehooks-ts';
import useSpotify from './useSpotify';

export default function useApi() {
  const { replace } = useRouter();
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [jobId, setJobId] = useState<null | string>(null)
  const { accessToken } = useSpotify()

  let [{ data: users = [] }, searchUsers] = useAxios<any>(
    {
      url: `${process.env.NEXT_PUBLIC_API_URL}/users/${searchQuery}`,
      method: 'GET',
    },
    { manual: true }
  )

  const [{ data: genJobId }, generate] = useAxios<any>(
    {
      url: `${process.env.NEXT_PUBLIC_API_URL}/generate`,
      method: 'POST'
    },
    { manual: true }
  )

  const [{ data: jobStatus }, status] = useAxios<any>(
    {
      url: `${process.env.NEXT_PUBLIC_API_URL}/generate/${jobId || genJobId}/progress`,
      method: 'GET'
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

  useEffect(() => {
    if (!genJobId) return;

    setJobId(genJobId)
    replace(`/status/${genJobId}`)
  }, [genJobId])

  useInterval(() => {
    status();
  }, jobId && jobStatus?.progress !== 100 ? 2000 : null);

  return {
    users,
    searchUsers,
    generate,
    searchQuery,
    setSearchQuery,
    selectedUser,
    setSelectedUser,
    jobId,
    setJobId,
    jobStatus
  };
}
