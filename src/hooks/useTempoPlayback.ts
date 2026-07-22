// ported from instrumenttuner@7156e04
import { useCallback, useRef } from 'react'
import { AudioContext } from 'react-native-audio-api'
import { scheduleClick } from '@/lib/audio/click'

export interface TempoPlayback {
  /** Play `beats` clicks at `bpm`, first beat accented. */
  readonly play: (bpm: number, beats: number) => void
}

export function useTempoPlayback(): TempoPlayback {
  const contextRef = useRef<AudioContext | null>(null)

  const play = useCallback((bpm: number, beats: number) => {
    if (!contextRef.current) contextRef.current = new AudioContext()
    const ctx = contextRef.current
    if (ctx.state === 'suspended') ctx.resume()

    const interval = 60 / bpm
    for (let i = 0; i < beats; i++) {
      scheduleClick(ctx, ctx.currentTime + i * interval, i === 0)
    }
  }, [])

  return { play }
}
