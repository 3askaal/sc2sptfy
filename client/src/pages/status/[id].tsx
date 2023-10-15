import { Spacer, Text, Button, Box, Link } from '3oilerplate'
import { Loader } from '@/components/loader'
import useApi from '@/hooks/useApi'
import { THEME } from '@/style';
import { ChevronsRight } from 'react-feather';

export default function Create() {
  const { jobStatus, cancel } = useApi()

  const isCompleted = jobStatus?.progress === 100

  return (
    <Spacer size="xl" s={{ height: '100%', alignItems: 'center', justifyContent: 'center' }}>
      <Spacer size="m" s={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
        <Text s={{ display: 'inline-flex', color: 'sc' }}>{ jobStatus?.scUser.username }</Text>
        <ChevronsRight size={16} color={THEME.colors.primary} />
        <Text s={{ display: 'inline-flex', color: 'sptfy' }}>{ jobStatus?.sptfyUser.display_name }</Text>
      </Spacer>
      <Loader progress={jobStatus?.progress} />

      { isCompleted ? (
        <Box df fdc aic>
          <Link href={`https://open.spotify.com/playlist/${jobStatus.playlist.id}`} target='_blank'>
            View playlist
          </Link>
        </Box>
      ) : (
        <Button onClick={() => cancel()}>Cancel</Button>
      ) }
    </Spacer>
  )
}
