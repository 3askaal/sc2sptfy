import { Button } from '3oilerplate'
import useSpotify from '../hooks/useSpotify'
import { THEME } from '@/style'

export function Login() {
  const { login } = useSpotify()

  return (
    <Button s={{ background: THEME.colors.sptfyGradient, color: 'black', border: 0 }} onClick={login}>Authenticate with Spotify</Button>
  )
}
