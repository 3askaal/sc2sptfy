import { Spacer, Text, Button, Box, Link } from '3oilerplate'
import { Loader } from '@/components/loader'
import useApi from '@/hooks/useApi'
import { THEME } from '@/style';
import { ChevronsRight } from 'react-feather';

export default function Who() {
  const { status, cancel } = useApi()

  const isCompleted = status?.progress === 100

  return (
    <Spacer size="xl" s={{ height: '100%', alignItems: 'center', justifyContent: 'center' }}>
      <Spacer size="m" s={{ justifyContent: 'center', alignItems: 'center' }}>
        <Spacer size="s" s={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <Link href={`https://soundcloud.com/${status?.scUser?.id}`}>
            <Text s={{ display: 'inline-flex', color: 'sc' }}>{ status?.scUser?.username }</Text>
          </Link>
          <ChevronsRight size={16} color={THEME.colors.primary} />
          <Link href={`https://open.spotify.com/user/${status?.sptfyUser?.id}`}>
            <Text s={{ display: 'inline-flex', color: 'sptfy' }}>{ status?.sptfyUser?.display_name }</Text>
          </Link>
        </Spacer>
        <Spacer s={{ flexDirection: 'row', fontSize: 's', color: 'primary', justifyContent: 'center', alignItems: 'center' }}>
          <Spacer size="xs" s={{ width: 'auto', flexDirection: 'row' }}>
            <Text s={{ color: 'greys.60' }}>Progress:</Text>
            <Text s={{ color: 'white' }}>{ status?.currentItem || 0 } / { status?.totalItems || 0}</Text>
          </Spacer>
          <Spacer size="xs" s={{ width: 'auto', flexDirection: 'row' }}>
            <Text s={{ color: 'greys.60' }}>Matches:</Text>
            <Text s={{ color: 'sptfy' }}>{ status?.matchCount || 0 } ({ status?.accuracy }%)</Text>
          </Spacer>
        </Spacer>
      </Spacer>
      <Loader progress={status?.progress} />
      { isCompleted ? (
        <Box df fdc aic>
          <Link href={`https://open.spotify.com/playlist/${status?.playlistId}`} target='_blank'>
            View playlist
          </Link>
        </Box>
      ) : (
        <Button onClick={() => cancel()}>Cancel</Button>
      ) }
    </Spacer>
  )
}
