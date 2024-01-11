import { Spacer, Input, List, ListItem, Box, Button } from '3oilerplate'
import useApi from '@/hooks/useApi'
import Image from 'next/image'
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useLocalStorage } from 'usehooks-ts';

export default function Who() {
  const { push } = useRouter();
  const { users, setSearchQuery } = useApi()
  const [selectedUser, setSelectedUser] = useLocalStorage<any>('selectedUser', null);

  useEffect(() => {
    setSelectedUser(null);
  }, [])

  const onSearch = (searchQuery: string) => {
    setSearchQuery(searchQuery);
    setSelectedUser(null);
  }

  return (
    <Spacer size="m" s={{ pt: 'xl', width: '100%', justifyContent: 'space-between' }}>
      <Spacer size="m" s={{ overflow: 'hidden'}}>
        <Input
          placeholder="Search for a user"
          onChange={onSearch}
          s={{ width: '100% !important' }}
        />
        { !!users.length && (
          <Box s={{ width: '100%', overflowY: 'auto' }}>
            <List>
              { users.map((user: any, index: number) => (
                <ListItem
                  key={`user-${index}`}
                  onClick={() => setSelectedUser(user)}
                  s={{
                    bg: user?.id === selectedUser?.id ? 'primary' : null,
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Box s={{ display: 'flex', overflow: 'hidden', borderRadius: '100%', mr: 'm', border: '1px solid', borderColor: 'primary' }}>
                    <Image
                      src={user.avatar_url}
                      width={40}
                      height={40}
                      alt={`${user.username.toLowerCase()}-avatar`}
                    />
                  </Box>
                  { user.username }
                </ListItem>
              )) }
            </List>
          </Box>
        )}
      </Spacer>
      <Button s={{ visibility: !selectedUser && 'hidden' }} onClick={() => push('what')}>Select</Button>
    </Spacer>
  )
}
