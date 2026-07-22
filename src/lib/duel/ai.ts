import { MIN_TARGET_BPM, MAX_TARGET_BPM } from './types'

export type AiTier = 'rookie' | 'amateur' | 'pro' | 'virtuoso' | 'maestro'

export const AI_TIERS: readonly AiTier[] = [
  'rookie',
  'amateur',
  'pro',
  'virtuoso',
  'maestro',
]

export const AI_SIGMA: Readonly<Record<AiTier, number>> = {
  rookie: 20,
  amateur: 12,
  pro: 7,
  virtuoso: 4,
  maestro: 2.5,
}

const EPSILON = 1e-9 // rng() can return 0; log(0) is -Infinity

function gaussian(rng: () => number): number {
  const u1 = Math.max(rng(), EPSILON)
  const u2 = rng()
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
}

export function aiAnswer(
  target: number,
  tier: AiTier,
  rng: () => number = Math.random,
): number {
  const raw = Math.round(target + gaussian(rng) * AI_SIGMA[tier])
  return Math.min(MAX_TARGET_BPM, Math.max(MIN_TARGET_BPM, raw))
}

export function nextTier(tier: AiTier): AiTier | null {
  const i = AI_TIERS.indexOf(tier)
  return i < AI_TIERS.length - 1 ? AI_TIERS[i + 1] : null
}
