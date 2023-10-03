import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Wrapper, Container, Button, List, ListItem } from '3oilerplate'
import { User as UserIcon, ArrowLeft as ArrowLeftIcon } from 'react-feather'
import { Logo } from './logo'
import useSpotify from '../hooks/useSpotify'

export function Layout({ children }: any) {
  // const { push, back, query: { id: playlistId } } = useRouter()
  const { accessToken } = useSpotify()
  const [menuOpen, setMenuOpen] = useState(false)

  const navigate = (route: string) => {
    setMenuOpen(false)
    // push(route)
  }

  return (
    <Wrapper s={{ display: 'grid', gridTemplateRows: accessToken ? 'auto minmax(0, 1fr)' : 'auto', gridTemplateColumns: '1fr', justifyItems: 'center', gap: 'm' }}>
      {
        accessToken && (
          <>
            <Box df w100p jcc>
              <Logo small />
            </Box>

            {/* { playlistId && playlistId !== 'new' && (
              <Box posa l='0' t='0' s={{ p: 'm' }}>
                <Button isOutline onClick={back} s={{ p: 's', borderRadius: '100%' }}>
                  <ArrowLeftIcon size="14" />
                </Button>
              </Box>
            )} */}

            <Box posa r='0' t='0' s={{ p: 'm' }}>
              <Button isOutline onClick={() => setMenuOpen(!menuOpen)} s={{ p: 's', borderRadius: '100%' }}>
                <UserIcon size="14" />
              </Button>
            </Box>

            { menuOpen && (
              <Box df s={{ position: 'absolute', top: 0, right: 0, m: 'm', mt: 'xxl', minWidth: '140px', zIndex: 400 }}>
                <List s={{ borderRight: '1px solid', borderLeft: '1px solid', borderColor: 'primary', textAlign: 'center', cursor: 'pointer' }}>
                  <ListItem onClick={() => navigate('/playlists')}>My Playlists</ListItem>
                  <ListItem onClick={logout}>Logout</ListItem>
                </List>
              </Box>
            )}
          </>
        )
      }

      <Container s={{ display: 'grid', gridTemplateRows: 'minmax(0, 1fr)', maxWidth: '480px' }}>
        { children }
      </Container>
    </Wrapper>
  )
}
