import { useEffect, useState } from 'react'
import { aiAnswer, type AiTier } from '@/lib/duel/ai'

/** Minimum simulated AI "thinking" delay, in milliseconds. */
export const AI_THINK_MS_MIN = 1500
/** Maximum simulated AI "thinking" delay, in milliseconds. */
export const AI_THINK_MS_MAX = 3000

export interface UseAiTurnOptions {
  /** True when it is the AI's turn to answer (e.g. `phase === 'p2-turn'` in solo mode). */
  readonly active: boolean
  readonly target: number
  readonly tier: AiTier
  readonly onAnswer: (bpm: number) => void
  readonly rng?: () => number
}

export interface AiTurn {
  readonly thinking: boolean
}

export function useAiTurn(opts: UseAiTurnOptions): AiTurn {
  const { active, target, tier, onAnswer, rng = Math.random } = opts
  const [thinking, setThinking] = useState(false)

  useEffect(() => {
    if (!active) return undefined

    // Intentional: this effect only runs on the false->true edge of `active`
    // (see the exhaustive-deps disable below), so this setState cannot cascade.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThinking(true)
    const delay = AI_THINK_MS_MIN + rng() * (AI_THINK_MS_MAX - AI_THINK_MS_MIN)
    const timeoutId = setTimeout(() => {
      onAnswer(aiAnswer(target, tier, rng))
      setThinking(false)
    }, delay)

    return () => {
      clearTimeout(timeoutId)
      setThinking(false)
    }
    // target/tier/onAnswer/rng are fixed for the duration of a single AI
    // turn — only `active` flipping should start/cancel this effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  return { thinking }
}
