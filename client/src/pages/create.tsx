import { Spacer, Input, List, ListItem, Box } from '3oilerplate'
import { ScrollContainer } from '@/components'
import useApi from '@/hooks/useApi'
import Image from 'next/image'

export default function Create() {
  const { users, setSearchQuery, selectedUser, setSelectedUser } = useApi()

  return (
    <Spacer size="xl" s={{ height: '100%', alignItems: 'center', justifyContent: 'center' }}>
      <Input
        onChange={(searchQuery: string) => setSearchQuery(searchQuery)}
        s={{ width: '100% !important' }}
      />
      { !!users.length && (
        <ScrollContainer>
          <List>
            { users.map((user: any, index: number) => (
              <ListItem
                key={`user-${index}`}
                onClick={() => setSelectedUser(user)}
                s={{
                  bg: user?.id === selectedUser?.id ? 'primary' : null,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Box s={{ overflow: 'hidden', borderRadius: '100%', mr: 'm', border: '1px solid', borderColor: 'white' }}>
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
        </ScrollContainer>
      )}
    </Spacer>
  )
}
