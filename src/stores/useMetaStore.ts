import { create } from 'zustand'
import { z } from 'zod'
import { getJSON, setJSON } from '@/lib/storage'
import {
  INITIAL_META,
  applyMatchResult,
  type MatchSummary,
  type MetaState,
} from '@/lib/meta/stats'

const META_KEY = 'metroduel-meta'

// Mirrors AiTier from '@/lib/duel/ai' — duplicated as string literals because
// zod schemas validate raw JSON, not TS types.
const aiTierSchema = z.enum(['rookie', 'amateur', 'pro', 'virtuoso', 'maestro'])

const modeStatsSchema = z.object({
  matches: z.number(),
  wins: z.number(),
  bestStreak: z.number(),
  bestAccuracy: z.number().nullable(),
})

const metaStateSchema = z.object({
  unlockedTier: aiTierSchema,
  solo: modeStatsSchema,
  hotseat: modeStatsSchema,
})

export interface MetaStoreState {
  meta: MetaState
  recordMatch: (summary: MatchSummary) => void
}

export const useMetaStore = create<MetaStoreState>((set, get) => ({
  meta: getJSON(META_KEY, metaStateSchema, INITIAL_META),
  recordMatch: (summary) => {
    const next = applyMatchResult(get().meta, summary)
    setJSON(META_KEY, next)
    set({ meta: next })
  },
}))
