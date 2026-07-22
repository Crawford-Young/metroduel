import type { MatchSummary, MetaState } from '@/lib/meta/stats'

/* eslint-disable @typescript-eslint/no-require-imports -- CJS require() is used
   deliberately so jest.resetModules() can force a fresh module instance per
   test, simulating an app restart to verify MMKV rehydration; dynamic
   import() is not usable here without --experimental-vm-modules. */

const mockStorageMap = new Map<string, string>()

jest.mock('react-native-mmkv', () => ({
  createMMKV: jest.fn(() => ({
    getString: (key: string) => mockStorageMap.get(key),
    set: (key: string, value: string) => {
      mockStorageMap.set(key, value)
    },
    clearAll: () => {
      mockStorageMap.clear()
    },
  })),
}))

beforeEach(() => {
  mockStorageMap.clear()
  jest.resetModules()
})

function soloWin(overrides: Partial<MatchSummary> = {}): MatchSummary {
  return {
    kind: 'solo',
    humanWon: true,
    tier: 'rookie',
    maxWinsInMatch: 1,
    bestDistance: null,
    ...overrides,
  }
}

describe('useMetaStore', () => {
  it('defaults to INITIAL_META when nothing is persisted', () => {
    const { useMetaStore } =
      require('@/stores/useMetaStore') as typeof import('@/stores/useMetaStore')
    const { INITIAL_META } =
      require('@/lib/meta/stats') as typeof import('@/lib/meta/stats')
    expect(useMetaStore.getState().meta).toEqual(INITIAL_META)
  })

  it('falls back to INITIAL_META when the persisted meta JSON is corrupt', () => {
    mockStorageMap.set('metroduel-meta', 'not-json{{{')
    const { useMetaStore } =
      require('@/stores/useMetaStore') as typeof import('@/stores/useMetaStore')
    const { INITIAL_META } =
      require('@/lib/meta/stats') as typeof import('@/lib/meta/stats')
    expect(useMetaStore.getState().meta).toEqual(INITIAL_META)
  })

  it('falls back to INITIAL_META when the persisted meta JSON does not match the schema', () => {
    mockStorageMap.set(
      'metroduel-meta',
      JSON.stringify({ unlockedTier: 'not-a-real-tier' }),
    )
    const { useMetaStore } =
      require('@/stores/useMetaStore') as typeof import('@/stores/useMetaStore')
    const { INITIAL_META } =
      require('@/lib/meta/stats') as typeof import('@/lib/meta/stats')
    expect(useMetaStore.getState().meta).toEqual(INITIAL_META)
  })

  it('recordMatch applies the match result via applyMatchResult and updates state', () => {
    const { useMetaStore } =
      require('@/stores/useMetaStore') as typeof import('@/stores/useMetaStore')
    useMetaStore.getState().recordMatch(soloWin())
    const meta: MetaState = useMetaStore.getState().meta
    expect(meta.unlockedTier).toBe('amateur')
    expect(meta.solo.matches).toBe(1)
    expect(meta.solo.wins).toBe(1)
  })

  it('persists recordMatch results across a simulated app restart (module re-init)', () => {
    const { useMetaStore: firstInstance } =
      require('@/stores/useMetaStore') as typeof import('@/stores/useMetaStore')
    firstInstance.getState().recordMatch(soloWin())

    jest.resetModules()

    const { useMetaStore: secondInstance } =
      require('@/stores/useMetaStore') as typeof import('@/stores/useMetaStore')
    expect(secondInstance.getState().meta.unlockedTier).toBe('amateur')
    expect(secondInstance.getState().meta.solo.matches).toBe(1)
  })
})
