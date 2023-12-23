import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Box, Wrapper, Container, Button, List, ListItem } from '3oilerplate'
import { User as UserIcon } from 'react-feather'
import { Logo } from './logo'
import useSpotify from '../hooks/useSpotify'

export function Layout({ children }: any) {
  const pathname = usePathname()
  const { accessToken, logout } = useSpotify()
  const [menuOpen, setMenuOpen] = useState(false)

  const shouldShowTopMenu = accessToken && pathname !== '/';

  return (
    <Wrapper s={{ display: 'grid', gridTemplateRows: shouldShowTopMenu ? 'auto minmax(0, 1fr)' : 'auto', gridTemplateColumns: '1fr', justifyItems: 'center', gap: 'm' }}>
      {
        shouldShowTopMenu && (
          <>
            <Box df w100p jcc>
              <Logo small />
            </Box>

            <Box posa r='0' t='0' s={{ p: 'm' }}>
              <Button isOutline onClick={() => setMenuOpen(!menuOpen)} s={{ p: 's', borderRadius: '100%' }}>
                <UserIcon size="14" />
              </Button>
            </Box>

            { menuOpen && (
              <Box df s={{ position: 'absolute', top: 0, right: 0, m: 'm', mt: 'xxl', minWidth: '140px', zIndex: 400 }}>
                <List s={{ borderRight: '1px solid', borderLeft: '1px solid', borderColor: 'primary', textAlign: 'center', cursor: 'pointer' }}>
                  <ListItem onClick={() => logout()}>Logout</ListItem>
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
