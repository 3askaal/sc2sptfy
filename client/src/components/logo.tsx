import { s, Title } from '3oilerplate'

const SLogoSc = s.div(({ theme, color }: any) => ({
  display: 'inline-flex',
  background: theme.colors.scGradient,
  '-webkit-background-clip': 'text',
  '-webkit-text-fill-color': 'transparent',
  marginRight: '.05rem'
}))

const SLogoSptfy = s.div(({ theme, color }: any) => ({
  display: 'inline-flex',
  background: theme.colors.sptfyGradient,
  '-webkit-background-clip': 'text',
  '-webkit-text-fill-color': 'transparent',
  marginLeft: '.05rem'
}))

export function Logo({ small }: any) {
  return (
    <Title s={{ fontFamily: 'logo', fontSize: small ? '2.25rem' : '3.5rem', userSelect: 'none' }}>
      <SLogoSc color="sc">sc</SLogoSc>2<SLogoSptfy color="sptfy">sptfy</SLogoSptfy>
    </Title>
  )
}
