import { Spacer, Input, List, ListItem } from '3oilerplate'
import useApi from '@/hooks/useApi'

export default function Create() {
  const { users, setSearchQuery, selectedUser, setSelectedUser } = useApi()

  return (
    <Spacer size="xl" s={{ height: '100%', alignItems: 'center', justifyContent: 'center' }}>
      <Input
        onChange={(searchQuery: string) => setSearchQuery(searchQuery)}
        s={{ width: '100% !important' }}
      />
      { !!users.length && (
        <List>
          { users.map((user: any, index: number) => (
            <ListItem
              key={`user-${index}`}
              onClick={() => setSelectedUser(user)}
              s={{ bg: user?.id === selectedUser?.id ? 'primary' : null }}
            >
              { user.username }
            </ListItem>
          )) }
        </List>
      )}
    </Spacer>
  )
}
