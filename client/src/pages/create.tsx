import { Spacer, Input, List, ListItem, Box, Button } from '3oilerplate'
import useApi from '@/hooks/useApi'
import Image from 'next/image'
import { useState } from 'react'

export default function Create() {
  const { users, setSearchQuery, generate } = useApi()
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const onSearch = (searchQuery: string) => {
    setSearchQuery(searchQuery);
    setSelectedUser(null);
  }

  return (
    <Spacer size="xl" s={{ alignItems: 'center', justifyContent: 'center' }}>
      <Input
        onChange={onSearch}
        s={{ width: '100% !important' }}
      />
      { !!users.length && (
        <Box s={{ width: '100%', overflowY: 'auto', maxHeight: '50%' }}>
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
      { selectedUser && (
        <Button onClick={() => generate(selectedUser)}>Generate</Button>
      ) }
    </Spacer>
  )
}
