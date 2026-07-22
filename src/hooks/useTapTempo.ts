// ported from instrumenttuner@7156e04
import { useCallback, useRef, useState } from 'react'
import { averageBpmFromTaps } from '@/lib/tempo'

export interface UseTapTempoOptions {
  readonly requiredTaps: number
  readonly onComplete: (bpm: number) => void
}

export interface TapTempo {
  readonly tapCount: number
  readonly tap: () => void
  readonly reset: () => void
}

export function useTapTempo({
  requiredTaps,
  onComplete,
}: UseTapTempoOptions): TapTempo {
  const [tapCount, setTapCount] = useState(0)
  const timestampsRef = useRef<number[]>([])

  const tap = useCallback(() => {
    timestampsRef.current.push(Date.now())
    const count = timestampsRef.current.length
    setTapCount(count)
    if (count >= requiredTaps) {
      const bpm = averageBpmFromTaps(timestampsRef.current)
      if (bpm !== null) onComplete(bpm)
    }
  }, [requiredTaps, onComplete])

  const reset = useCallback(() => {
    timestampsRef.current = []
    setTapCount(0)
  }, [])

  return { tapCount, tap, reset }
}
