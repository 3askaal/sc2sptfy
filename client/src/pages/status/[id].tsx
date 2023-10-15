import { Spacer, Text, Button, Box, Link } from '3oilerplate'
import { Loader } from '@/components/loader'
import useApi from '@/hooks/useApi'
import { THEME } from '@/style';
import { ChevronsRight } from 'react-feather';

export default function Create() {
  const { status, cancel } = useApi()

  const isCompleted = status?.progress === 100

  return (
    <Spacer size="xl" s={{ height: '100%', alignItems: 'center', justifyContent: 'center' }}>
      <Spacer size="m" s={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
        <Text s={{ display: 'inline-flex', color: 'sc' }}>{ status?.scUser.username }</Text>
        <ChevronsRight size={16} color={THEME.colors.primary} />
        <Text s={{ display: 'inline-flex', color: 'sptfy' }}>{ status?.sptfyUser.display_name }</Text>
      </Spacer>
      <Loader progress={status?.progress} />

      { isCompleted ? (
        <Box df fdc aic>
          <Link href={`https://open.spotify.com/playlist/${status.playlist.id}`} target='_blank'>
            View playlist
          </Link>
        </Box>
      ) : (
        <Button onClick={() => cancel()}>Cancel</Button>
      ) }
    </Spacer>
  )
}
