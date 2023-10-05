import { Spacer, Input, List, ListItem } from '3oilerplate'
import useApi from '@/hooks/useApi'

export default function Create() {
  const { users, searchUsers } = useApi()

  return (
    <Spacer size="xl" s={{ alignItems: 'center', justifyContent: 'center' }}>
      <Spacer s={{ alignItems: 'center', justifyContent: 'center' }}>
        <Input onChange={(searchQuery: string) => searchUsers(searchQuery)}></Input>
        <List>
          { users.map((user: any, index: number) => (
            <ListItem key={`user-${index}`}>
              { user.name }
            </ListItem>
          )) }
        </List>
      </Spacer>
    </Spacer>
  )
}
