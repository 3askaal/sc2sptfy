import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import useAxios from 'axios-hooks';
import { useDebounce, useInterval } from 'usehooks-ts';
import useSpotify from './useSpotify';

export default function useApi() {
  const { replace, query: { id } } = useRouter();
  const [searchQuery, setSearchQuery] = useState('')
  const [jobId, setJobId] = useState<null | string>(null)
  const { accessToken } = useSpotify()

  let [{ data: users = [] }, searchUsers] = useAxios<any>(
    {
      url: `${process.env.NEXT_PUBLIC_API_URL}/users/${searchQuery}`,
      method: 'GET',
    },
    { manual: true }
  )

  const [{ data: generateRes }, generateCallback] = useAxios<any>(
    {
      url: `${process.env.NEXT_PUBLIC_API_URL}/generate`,
      method: 'POST'
    },
    { manual: true }
  )

  const [{ data: statusRes }, statusCallback] = useAxios<any>(
    {
      url: `${process.env.NEXT_PUBLIC_API_URL}/generate/${jobId}/progress`,
      method: 'GET'
    },
    { manual: true }
  )

  const [{ data: cancelRes }, cancelCallback] = useAxios<any>(
    {
      url: `${process.env.NEXT_PUBLIC_API_URL}/generate/${jobId}/cancel`,
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
    if (jobId) return;
    if (!generateRes && !id) return;

    if (generateRes) {
      replace(`/status/${generateRes}`);
    }

    setJobId(generateRes || id);
  }, [generateRes, id])

  const generate = (user: any) => {
    generateCallback({
      data: {
        user,
        accessToken
      }
    })
  }

  const cancel = () => {
    cancelCallback();
  }

  useInterval(() => {
    statusCallback();
  }, jobId && statusRes?.progress !== 100 ? 2000 : null);

  return {
    searchQuery,
    setSearchQuery,
    users,
    searchUsers,
    status: statusRes,
    generate,
    cancel,
  };
}
