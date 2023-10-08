import { Spacer, Text } from '3oilerplate'
import { Loader } from '@/components/loader'
import useApi from '@/hooks/useApi'
import { useRouter } from 'next/router';
import { useEffect } from 'react'

export default function Create() {
  const { query: { id } } = useRouter();
  const { jobId, setJobId, jobStatus } = useApi()

  useEffect(() => {
    if (!jobId && id) {
      setJobId(id as string)
    }
  }, [jobId, id])

  return (
    <Spacer size="l" s={{ height: '100%', alignItems: 'center', justifyContent: 'center' }}>
      <Spacer size="xxs" s={{ alignItems: 'center' }}>
        <Text>Generating sc2sptfy playlist</Text>
        <Text s={{ color: 'sc' }}>from: { jobStatus?.scUser.username }</Text>
        <Text s={{ color: 'sptfy' }}>to: { jobStatus?.sptfyUser.display_name }</Text>
      </Spacer>
      <Loader progress={jobStatus?.progress} />
    </Spacer>
  )
}
