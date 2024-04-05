import { Spacer, Text, Box, Button, Checkbox } from '3oilerplate'
import useApi from '@/hooks/useApi'
import useAxios from 'axios-hooks';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react'
import { useLocalStorage } from 'usehooks-ts';

export default function Create() {
  const { generate } = useApi()
  const [selectedUser, setSelectedUser] = useLocalStorage<any>('selectedUser', null);
  const [selection, setSelection] = useState<any>({
    tracks: false,
    likes: false,
    playlists: {}
  });

  let [{ data: userDetail }, getUserDetail] = useAxios<any>(
    {
      url: `${process.env.NEXT_PUBLIC_API_URL}/user/${selectedUser?.id}/collect`,
      method: 'GET',
    },
    { manual: true }
  )

  useEffect(() => {
    getUserDetail()
  }, [])

  const toggle = (key: string, playlistId?: number) => {
    if (playlistId) {
      setSelection({
        ...selection,
        playlists: {
          ...selection.playlists,
          [playlistId]: !selection.playlists[playlistId]
        }
      })
    } else {
      setSelection({ ...selection, [key]: !selection[key] })
    }
  }

  const someSelected = selection.tracks || selection.likes || Object.values(selection.playlists).some((value) => value);

  return (
    <Spacer size="m" s={{ justifyContent: 'center', width: '100%' }}>
      <Box s={{ width: '100%', overflowY: 'auto', maxHeight: '80%' }}>
        <Spacer size="m" s={{ justifyContent: 'center', width: '100%' }}>

          { !!userDetail?.tracks.length && (
            <label>
              <Spacer
                s={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  border: 'thick',
                  borderColor: 'primary',
                  borderRadius: 'm',
                  px: 'm',
                  cursor: 'pointer'
                }}
              >
                <Checkbox onChange={() => toggle(`tracks`)} />
                <Box df fww s={{ flexBasis: '50%', maxWidth: '80px' }}>
                  { userDetail?.tracks.slice(0, 4).map(({ title, artwork_url }: any, trackIndex: number) => (
                    <Box df s={{ overflow: 'hidden' }} key={trackIndex}>
                      <Image
                        src={artwork_url || ''}
                        width={40}
                        height={40}
                        alt={`${title.toLowerCase()}-avatar`}
                      />
                    </Box>
                  )) }
                </Box>
                <Text>Tracks</Text>
              </Spacer>
            </label>
          )}

          { !!userDetail?.likes.length && (
            <label>
              <Spacer
                s={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  border: 'thick',
                  borderColor: 'primary',
                  borderRadius: 'm',
                  px: 'm',
                  cursor: 'pointer'
                }}
              >
                <Checkbox onChange={() => toggle(`likes`)} />
                <Box df fww s={{ flexBasis: '50%', maxWidth: '80px' }}>
                  { userDetail?.likes.slice(0, 4).map(({ title, artwork_url }: any, trackIndex: number) => (
                    <Box df s={{ overflow: 'hidden' }} key={trackIndex}>
                      <Image
                        src={artwork_url || ''}
                        width={40}
                        height={40}
                        alt={`${title.toLowerCase()}-avatar`}
                      />
                    </Box>
                  )) }
                </Box>
                <Text>Likes</Text>
              </Spacer>
            </label>
          )}

          { !!userDetail?.playlists.length && userDetail?.playlists.map(({ id, title, tracks }: any, playlistIndex: number) => (
            <label key={playlistIndex}>
              <Spacer
                s={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  border: 'thick',
                  borderColor: 'primary',
                  borderRadius: 'm',
                  px: 'm',
                  cursor: 'pointer'
                }}
              >
                <Checkbox onChange={() => toggle('playlists', id)} />
                <Box df fww s={{ flexBasis: '50%', maxWidth: '80px' }}>
                  { tracks.slice(0, 4).map(({ title, artwork_url }: any, trackIndex: number) => (
                    <Box df s={{ overflow: 'hidden' }} key={trackIndex}>
                      <Image
                        src={artwork_url || ''}
                        width={40}
                        height={40}
                        alt={`${title.toLowerCase()}-avatar`}
                      />
                    </Box>
                  )) }
                </Box>
                <Text>{ title }</Text>
              </Spacer>
            </label>
          )) }


        </Spacer>
      </Box>

      { someSelected && (
        <Button onClick={() => generate(selectedUser, selection)}>Generate</Button>
      ) }
    </Spacer>
  )
}
