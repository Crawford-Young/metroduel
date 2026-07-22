import {
  INITIAL_META,
  applyMatchResult,
  type MatchSummary,
  type MetaState,
} from '@/lib/meta/stats'

function soloWin(
  tier: MatchSummary['tier'],
  overrides: Partial<MatchSummary> = {},
): MatchSummary {
  return {
    kind: 'solo',
    humanWon: true,
    tier,
    maxWinsInMatch: 1,
    bestDistance: null,
    ...overrides,
  }
}

describe('INITIAL_META', () => {
  it('starts with rookie unlocked and zeroed stats for both modes', () => {
    const expected: MetaState = {
      unlockedTier: 'rookie',
      solo: { matches: 0, wins: 0, bestStreak: 0, bestAccuracy: null },
      hotseat: { matches: 0, wins: 0, bestStreak: 0, bestAccuracy: null },
    }
    expect(INITIAL_META).toEqual(expected)
  })
})

describe('applyMatchResult — tier unlocking', () => {
  it('unlocks the next tier on a solo win at the current frontier', () => {
    const result = applyMatchResult(INITIAL_META, soloWin('rookie'))
    expect(result.unlockedTier).toBe('amateur')
  })

  it('does not unlock when the win is below the current frontier', () => {
    const meta: MetaState = { ...INITIAL_META, unlockedTier: 'pro' }
    const result = applyMatchResult(meta, soloWin('rookie'))
    expect(result.unlockedTier).toBe('pro')
  })

  it('keeps maestro as-is on a frontier win at the top tier', () => {
    const meta: MetaState = { ...INITIAL_META, unlockedTier: 'maestro' }
    const result = applyMatchResult(meta, soloWin('maestro'))
    expect(result.unlockedTier).toBe('maestro')
  })

  it('unlocks nothing on a loss at the frontier', () => {
    const result = applyMatchResult(
      INITIAL_META,
      soloWin('rookie', { humanWon: false }),
    )
    expect(result.unlockedTier).toBe('rookie')
  })

  it('unlocks nothing for a hotseat match regardless of tier/outcome', () => {
    const summary: MatchSummary = {
      kind: 'hotseat',
      humanWon: true,
      tier: null,
      maxWinsInMatch: 1,
      bestDistance: null,
    }
    const result = applyMatchResult(INITIAL_META, summary)
    expect(result.unlockedTier).toBe('rookie')
  })
})

describe('applyMatchResult — mode stats merge math', () => {
  it('increments matches always, wins only on a human win', () => {
    const afterWin = applyMatchResult(INITIAL_META, soloWin('rookie'))
    expect(afterWin.solo.matches).toBe(1)
    expect(afterWin.solo.wins).toBe(1)

    const afterLoss = applyMatchResult(
      INITIAL_META,
      soloWin('rookie', { humanWon: false }),
    )
    expect(afterLoss.solo.matches).toBe(1)
    expect(afterLoss.solo.wins).toBe(0)
  })

  it('max-merges bestStreak against the prior value', () => {
    const meta: MetaState = {
      ...INITIAL_META,
      solo: { matches: 2, wins: 2, bestStreak: 3, bestAccuracy: null },
    }
    const lowerStreak = applyMatchResult(
      meta,
      soloWin('rookie', { maxWinsInMatch: 2 }),
    )
    expect(lowerStreak.solo.bestStreak).toBe(3)

    const higherStreak = applyMatchResult(
      meta,
      soloWin('rookie', { maxWinsInMatch: 5 }),
    )
    expect(higherStreak.solo.bestStreak).toBe(5)
  })

  it('min-merges bestAccuracy, treating null as "no record yet"', () => {
    const fromNull = applyMatchResult(
      INITIAL_META,
      soloWin('rookie', { bestDistance: 12 }),
    )
    expect(fromNull.solo.bestAccuracy).toBe(12)

    const meta: MetaState = {
      ...INITIAL_META,
      solo: { matches: 1, wins: 1, bestStreak: 1, bestAccuracy: 12 },
    }
    const worse = applyMatchResult(
      meta,
      soloWin('rookie', { bestDistance: 20 }),
    )
    expect(worse.solo.bestAccuracy).toBe(12)

    const better = applyMatchResult(
      meta,
      soloWin('rookie', { bestDistance: 5 }),
    )
    expect(better.solo.bestAccuracy).toBe(5)

    const summaryWithNoDistance = applyMatchResult(
      meta,
      soloWin('rookie', { bestDistance: null }),
    )
    expect(summaryWithNoDistance.solo.bestAccuracy).toBe(12)
  })

  it('updates only the hotseat stats block for a hotseat match, leaving solo untouched', () => {
    const summary: MatchSummary = {
      kind: 'hotseat',
      humanWon: true,
      tier: null,
      maxWinsInMatch: 4,
      bestDistance: 8,
    }
    const result = applyMatchResult(INITIAL_META, summary)
    expect(result.hotseat).toEqual({
      matches: 1,
      wins: 1,
      bestStreak: 4,
      bestAccuracy: 8,
    })
    expect(result.solo).toEqual(INITIAL_META.solo)
  })

  it('updates only the solo stats block for a solo match, leaving hotseat untouched', () => {
    const result = applyMatchResult(INITIAL_META, soloWin('rookie'))
    expect(result.hotseat).toEqual(INITIAL_META.hotseat)
  })
})
