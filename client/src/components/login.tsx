import { Button } from '3oilerplate'
import useSpotify from '../hooks/useSpotify'
import { THEME } from '@/style'

export function Login() {
  const { login } = useSpotify()

  return (
    <Button onClick={login}>Authenticate with Spotify</Button>
  )
}
