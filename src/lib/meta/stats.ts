import { AiTier, nextTier } from '@/lib/duel/ai'

export type MatchKind = 'solo' | 'hotseat'

export interface ModeStats {
  readonly matches: number
  readonly wins: number // solo: human wins; hotseat: p1 wins (label only)
  readonly bestStreak: number // best in-match win multiplier streak (max wins in one match)
  readonly bestAccuracy: number | null // smallest round distance ever (lower better)
}

export interface MetaState {
  readonly unlockedTier: AiTier // highest unlocked
  readonly solo: ModeStats
  readonly hotseat: ModeStats
}

export interface MatchSummary {
  readonly kind: MatchKind
  readonly humanWon: boolean
  readonly tier: AiTier | null // solo only
  readonly maxWinsInMatch: number
  readonly bestDistance: number | null
}

const ZERO_MODE_STATS: ModeStats = {
  matches: 0,
  wins: 0,
  bestStreak: 0,
  bestAccuracy: null,
}

export const INITIAL_META: MetaState = {
  unlockedTier: 'rookie',
  solo: ZERO_MODE_STATS,
  hotseat: ZERO_MODE_STATS,
}

function mergeModeStats(stats: ModeStats, summary: MatchSummary): ModeStats {
  return {
    matches: stats.matches + 1,
    wins: stats.wins + (summary.humanWon ? 1 : 0),
    bestStreak: Math.max(stats.bestStreak, summary.maxWinsInMatch),
    bestAccuracy:
      summary.bestDistance === null
        ? stats.bestAccuracy
        : stats.bestAccuracy === null
          ? summary.bestDistance
          : Math.min(stats.bestAccuracy, summary.bestDistance),
  }
}

function computeUnlockedTier(meta: MetaState, summary: MatchSummary): AiTier {
  if (summary.kind !== 'solo' || !summary.humanWon || summary.tier === null) {
    return meta.unlockedTier
  }
  if (summary.tier !== meta.unlockedTier) {
    return meta.unlockedTier
  }
  return nextTier(summary.tier) ?? meta.unlockedTier
}

export function applyMatchResult(
  meta: MetaState,
  summary: MatchSummary,
): MetaState {
  const unlockedTier = computeUnlockedTier(meta, summary)
  if (summary.kind === 'solo') {
    return { ...meta, unlockedTier, solo: mergeModeStats(meta.solo, summary) }
  }
  return {
    ...meta,
    unlockedTier,
    hotseat: mergeModeStats(meta.hotseat, summary),
  }
}
