import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { s } from '3oilerplate'
import { debounce } from 'lodash'
import chroma from 'chroma-js'
import { THEME } from '@/style'

export const SLoaderWrapper = s.div({
  display: 'flex',
  position: 'relative',
  alignItems: 'center',
  justifyContent: 'center',
  width: '12rem',
  height: '12rem',
})

export const SLoader = s.svg({
  width: '100%',
  height: '100%',
  overflow: 'visible',
})

export const SLoaderRect = styled.rect<any>(
  ({ strokeDashoffset, color }) => ({
    width: '100%',
    height: '100%',
    opacity: 0.5,
    fill: 'none',
    transition: 'all .4s ease',
    stroke: color,
    strokeLinecap: 'round',
    strokeWidth: 5,
    strokeDashoffset
  })
)

export const SLoaderProgress = s.div(({ color }: any) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0.75,
  fontWeight: 'bold',
  color,
}))

export function Loader({ progress = 0 }: { progress: number }) {
  const [values, setValues] = useState<{ width: number, height: number, perimeter: number} | null>(null)
  const loaderRef: any = useRef()

  const updateValues = (ref?: any) => {
    if (!ref) return;

    const dimensions = ref?.getBoundingClientRect()

    setValues({
      width: dimensions.width,
      height: dimensions.height,
      // doing * 0.8 here because it's a rounded shape
      // and this value needs to match the outline exactly
      perimeter: (dimensions.width * 2 + dimensions.height * 2) * 0.8,
    })
  }

  useEffect(() => {
    if (!loaderRef.current) return;

    updateValues(loaderRef.current)

    window.addEventListener('resize', debounce(() => updateValues(loaderRef.current), 50), true)

    return () => {
      window.removeEventListener('resize', debounce(() => updateValues(), 50), true)
    }
  }, [loaderRef.current])

  const strokeDashoffset = values?.perimeter ? values.perimeter - (values.perimeter * (progress / 100)) : 0;
  const progressColor = chroma.mix(THEME.colors.sc, THEME.colors.sptfy, progress / 100).hex();

  return (
    <div ref={loaderRef}>
      <SLoaderWrapper>
        {
          values?.perimeter && (
            <>
              <SLoader>
                <SLoaderRect
                  width={values?.width}
                  height={values?.height}
                  rx={100}
                  ry={100}
                  strokeDasharray={values?.perimeter}
                  strokeDashoffset={strokeDashoffset}
                  color={progressColor}
                />
              </SLoader>
              <SLoaderProgress color={progressColor}>{ progress }%</SLoaderProgress>
            </>
          )
        }
      </SLoaderWrapper>
    </div>
  )
}
