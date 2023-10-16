import { createGlobalStyle } from 'styled-components'

export const LocalGlobalStyle = createGlobalStyle({
  '*': {
    '-webkit-font-smoothing': 'antialiased',
    '-moz-osx-font-smoothing': 'grayscale',
  },

  'html, body, body > div': {
    height: '100%',
  },

  a: {
    textDecoration: 'none',
  },
})
