import { Button } from '3oilerplate'
import useSpotify from '../hooks/useSpotify'

export function Login() {
  const { login } = useSpotify()

  return (
    <Button sptfy onClick={login}>Authenticate with Spotify</Button>
  )
}
