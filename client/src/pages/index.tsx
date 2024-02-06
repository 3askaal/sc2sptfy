import { Spacer, Text } from '3oilerplate'
import { Login, Logo } from '../components'

export default function Home() {
  return (
    <Spacer size="xl" s={{ alignItems: 'center', justifyContent: 'center' }}>
      <Spacer s={{ alignItems: 'center', justifyContent: 'center' }}>
        <Logo />
        <Text s={{ textAlign: 'center' }}>Transfer your Soundcloud data to Spotify</Text>
      </Spacer>
      <Login />
    </Spacer>
  )
}
