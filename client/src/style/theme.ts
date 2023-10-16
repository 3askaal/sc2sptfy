import { darken, brighten } from '3oilerplate'
import chroma from 'chroma-js'

export const fonts = {
  base: "'Cabin', sans-serif",
  title: "'Cabin', sans-serif",
  logo: "'Teko', sans-serif",
}

const black = brighten('#000', .5);
const white = darken('#fff', .5);

const PRIMARY = white
const SECONDARY = '#E90064'

const SUCCESS = '#59CE8F'

const sc = chroma('#ff5500').hex()
const sptfy = chroma('#1ed760').hex()

export const THEME = {
  rootFontSizes: ['10px', '14px', '16px'],
  fonts,
  colors: {
    black,
    white,
    primary: PRIMARY,
    primaryDark: darken(PRIMARY, .5),
    primaryLight: brighten(PRIMARY, 1),
    secondary: SECONDARY,
    secondaryDark: darken(SECONDARY, 1),
    secondaryLight: brighten(SECONDARY, 1.5),
    background: brighten('#000', .5),
    backgroundDark: darken('#212121', .5),
    color: white,
    success: SUCCESS,
    sc,
    sptfy,
    scGradient: `-webkit-linear-gradient(${darken(sc, 0)} 50%, ${darken(sc, .75)})`,
    sptfyGradient: `-webkit-linear-gradient(${darken(sptfy, 0)} 50%, ${darken(sptfy, .75)})`,
  },
  components: {
    Input: {
      default: {
        px: 0,
        borderTop: 0,
        borderLeft: 0,
        borderRight: 0,
        borderWidth: '1px',
        borderRadius: 0,
        color: 'black',
        paddingY: 'm',
        fontSize: '2rem'
      }
    },
    Button: {
      default: {
        background: 'sptfyGradient',
        color: 'black',
        border: 0,
      }
    }
  },
}
