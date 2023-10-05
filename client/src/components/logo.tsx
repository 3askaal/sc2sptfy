import { s, Title, darken } from '3oilerplate'

const SLogoSc = s.div(({ theme, color }: any) => ({
  display: 'inline-flex',
  background: theme.colors.scGradient,
  '-webkit-background-clip': 'text',
  '-webkit-text-fill-color': 'transparent',
  userSelect: 'none',
  marginRight: '.125rem'
}))

const SLogoSptfy = s.div(({ theme, color }: any) => ({
  display: 'inline-flex',
  background: theme.colors.sptfyGradient,
  '-webkit-background-clip': 'text',
  '-webkit-text-fill-color': 'transparent',
  userSelect: 'none',
  marginLeft: '.125rem'
}))

export function Logo({ small }: any) {
  return (
    <Title s={{ fontFamily: 'logo', fontSize: small ? '2.25rem' : '3.5rem' }}>
      <SLogoSc color="sc">sc</SLogoSc>2<SLogoSptfy color="sptfy">sptfy</SLogoSptfy>
    </Title>
  )
}
