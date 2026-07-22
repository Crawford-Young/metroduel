import { MIN_TARGET_BPM, MAX_TARGET_BPM } from '@/lib/duel/types'
import {
  AI_TIERS,
  AI_SIGMA,
  aiAnswer,
  nextTier,
  type AiTier,
} from '@/lib/duel/ai'

function stubRng(values: readonly number[]): () => number {
  let i = 0
  return () => {
    const v = values[i] ?? values[values.length - 1]
    i += 1
    return v
  }
}

describe('AI_TIERS', () => {
  it('is the ladder order rookie through maestro', () => {
    expect(AI_TIERS).toEqual([
      'rookie',
      'amateur',
      'pro',
      'virtuoso',
      'maestro',
    ])
  })
})

describe('AI_SIGMA', () => {
  it('gives each tier its documented noise width', () => {
    expect(AI_SIGMA.rookie).toBe(20)
    expect(AI_SIGMA.amateur).toBe(12)
    expect(AI_SIGMA.pro).toBe(7)
    expect(AI_SIGMA.virtuoso).toBe(4)
    expect(AI_SIGMA.maestro).toBe(2.5)
  })
})

describe('nextTier', () => {
  it('walks the ladder one rung at a time', () => {
    expect(nextTier('rookie')).toBe('amateur')
    expect(nextTier('amateur')).toBe('pro')
    expect(nextTier('pro')).toBe('virtuoso')
    expect(nextTier('virtuoso')).toBe('maestro')
  })

  it('returns null at the top of the ladder', () => {
    expect(nextTier('maestro')).toBeNull()
  })
})

describe('aiAnswer', () => {
  it('offsets the target by gaussian noise scaled by tier sigma, rounded', () => {
    // u1=0.5, u2=0 -> gaussian ≈ 1.1774100225154747
    const rng = stubRng([0.5, 0])
    expect(aiAnswer(120, 'maestro', rng)).toBe(123)
  })

  it('clamps the answer to MAX_TARGET_BPM when noise pushes it above range', () => {
    // u1=0, u2=0 -> u1 clamped by epsilon guard, gaussian ≈ 6.4379 (large positive)
    const rng = stubRng([0, 0])
    expect(aiAnswer(120, 'rookie', rng)).toBe(MAX_TARGET_BPM)
  })

  it('clamps the answer to MIN_TARGET_BPM when noise pushes it below range', () => {
    // u1=0.5, u2=0.5 -> gaussian ≈ -1.1774100225154747, sigma 20 -> well below 40
    const rng = stubRng([0.5, 0.5])
    expect(aiAnswer(40, 'rookie', rng)).toBe(MIN_TARGET_BPM)
  })

  it('guards against log(0) when rng() returns exactly 0, still returning a finite clamped number', () => {
    const rng = stubRng([0, 0.25])
    const result = aiAnswer(120, 'pro', rng)
    expect(Number.isFinite(result)).toBe(true)
    expect(result).toBeGreaterThanOrEqual(MIN_TARGET_BPM)
    expect(result).toBeLessThanOrEqual(MAX_TARGET_BPM)
  })

  it('defaults to Math.random when no rng is supplied', () => {
    const result = aiAnswer(120, 'amateur')
    expect(Number.isInteger(result)).toBe(true)
    expect(result).toBeGreaterThanOrEqual(MIN_TARGET_BPM)
    expect(result).toBeLessThanOrEqual(MAX_TARGET_BPM)
  })

  it.each(AI_TIERS)(
    'never leaves the [%s] tier answer outside the valid BPM range',
    (tier: AiTier) => {
      const rng = stubRng([0.9, 0.1])
      const result = aiAnswer(150, tier, rng)
      expect(result).toBeGreaterThanOrEqual(MIN_TARGET_BPM)
      expect(result).toBeLessThanOrEqual(MAX_TARGET_BPM)
    },
  )
})
