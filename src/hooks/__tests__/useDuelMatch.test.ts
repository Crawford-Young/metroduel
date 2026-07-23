// ported from instrumenttuner@7156e04 — diverges: Second Wind REVIVE action (see CLAUDE.md)
import { renderHook, act } from '@testing-library/react-native'
import {
  useDuelMatch,
  duelReducer,
  matchReducer,
  SECOND_WIND_HP,
} from '@/hooks/useDuelMatch'
import type { MatchState } from '@/hooks/useDuelMatch'
import { STARTING_HP } from '@/lib/duel/types'

// Deterministic RNG: always midpoint -> target 120
// randomTarget(rng) = MIN_TARGET_BPM + Math.round(rng() * (MAX_TARGET_BPM - MIN_TARGET_BPM))
//                   = 40 + Math.round(0.5 * 160) = 40 + 80 = 120
const rng = (): number => 0.5

// Returns a sequenced RNG that steps through values on each call.
// After exhausting the array, the last value is repeated.
function sequencedRng(values: readonly number[]): () => number {
  let i = 0
  return () => values[Math.min(i++, values.length - 1)]
}

describe('useDuelMatch', () => {
  it('starts in setup phase', async () => {
    const { result } = await renderHook(() => useDuelMatch(rng))
    expect(result.current.state.phase).toBe('setup')
  })

  it('startMatch -> p1-turn with target and full HP', async () => {
    const { result } = await renderHook(() => useDuelMatch(rng))
    await act(() => result.current.startMatch('tap'))
    expect(result.current.state.phase).toBe('p1-turn')
    expect(result.current.state.mode).toBe('tap')
    expect(result.current.state.target).toBe(120)
    expect(result.current.state.players[0].hp).toBe(STARTING_HP)
    expect(result.current.state.roundNumber).toBe(1)
  })

  it('first submit advances to p2-turn, stores p1 answer', async () => {
    const { result } = await renderHook(() => useDuelMatch(rng))
    await act(() => result.current.startMatch('tap'))
    await act(() => result.current.submit(120))
    expect(result.current.state.phase).toBe('p2-turn')
    expect(result.current.state.p1Answer).toBe(120)
  })

  it('second submit resolves round -> reveal with result', async () => {
    const { result } = await renderHook(() => useDuelMatch(rng))
    await act(() => result.current.startMatch('tap'))
    await act(() => result.current.submit(120)) // p1 perfect
    await act(() => result.current.submit(140)) // p2 off by 20
    expect(result.current.state.phase).toBe('reveal')
    expect(result.current.state.lastResult?.winner).toBe(0)
    expect(result.current.state.players[1].hp).toBe(STARTING_HP - 20)
  })

  it('submit while in setup phase is a no-op', async () => {
    // Exercises the `return state` fallthrough guard in the SUBMIT case.
    const { result } = await renderHook(() => useDuelMatch(rng))
    // Phase is 'setup' — neither 'p1-turn' nor 'p2-turn', so submit must be ignored.
    await act(() => result.current.submit(120))
    expect(result.current.state.phase).toBe('setup')
    expect(result.current.state.p1Answer).toBeNull()
  })

  it('lethal round goes straight to victory', async () => {
    // rng = () => 0.5 → target 120
    // p1 submits 120: distance 0 (perfect)
    // p2 submits 280: |280 - 120| = 160 = MAX_DISTANCE (clamped), distance 160
    // p1 wins with multiplier 1; damage = (160 - 0) * 1 = 160 = STARTING_HP → defeated
    const { result } = await renderHook(() => useDuelMatch(rng))
    await act(() => result.current.startMatch('tap'))
    await act(() => result.current.submit(120)) // p1 perfect
    await act(() => result.current.submit(280)) // p2 distance clamped to 160 → lethal
    expect(result.current.state.phase).toBe('victory')
    expect(result.current.state.players[1].hp).toBe(0)
  })

  it('nextRound draws a fresh target, resets answers, and increments roundNumber', async () => {
    // sequencedRng([0.5, 0.25]):
    //   1st call (startMatch)  → 0.5  → target = 40 + Math.round(0.5  * 160) = 120
    //   2nd call (nextRound)   → 0.25 → target = 40 + Math.round(0.25 * 160) = 80
    const seqRng = sequencedRng([0.5, 0.25])
    const { result } = await renderHook(() => useDuelMatch(seqRng))
    await act(() => result.current.startMatch('tap'))
    expect(result.current.state.target).toBe(120)
    await act(() => result.current.submit(120))
    await act(() => result.current.submit(140))
    await act(() => result.current.nextRound())
    expect(result.current.state.phase).toBe('p1-turn')
    expect(result.current.state.p1Answer).toBeNull()
    expect(result.current.state.p2Answer).toBeNull()
    expect(result.current.state.roundNumber).toBe(2)
    // Fresh target must differ from the initial 120 — regression guard.
    expect(result.current.state.target).toBe(80)
    expect(result.current.state.target).not.toBe(120)
  })

  it('rematch from victory resets to full HP, same mode', async () => {
    const { result } = await renderHook(() => useDuelMatch(rng))
    await act(() => result.current.startMatch('guess'))
    await act(() => result.current.rematch())
    expect(result.current.state.mode).toBe('guess')
    expect(result.current.state.players[0].hp).toBe(STARTING_HP)
    expect(result.current.state.players[1].hp).toBe(STARTING_HP)
    expect(result.current.state.phase).toBe('p1-turn')
  })

  it('reducer default arm returns the same state reference for unknown action types', async () => {
    const { result } = await renderHook(() => useDuelMatch(rng))
    const state = result.current.state
    expect(duelReducer(state, { type: 'UNKNOWN' } as never)).toBe(state)
  })

  it('defaults to Math.random when no rng is provided', async () => {
    const { result } = await renderHook(() => useDuelMatch())
    await act(() => result.current.startMatch('tap'))
    expect(result.current.state.target).toBeGreaterThanOrEqual(40)
    expect(result.current.state.target).toBeLessThanOrEqual(200)
  })
})

describe('Second Wind revive', () => {
  // Crafted victory state: player 0 is the decorated winner (wins=2,
  // multiplier=3), player 1 is defeated (hp 0) and eligible for revive.
  const victoryState: MatchState = {
    phase: 'victory',
    mode: 'tap',
    target: 120,
    players: [
      { hp: 100, wins: 2, multiplier: 3 },
      { hp: 0, wins: 0, multiplier: 1 },
    ],
    p1Answer: 120,
    p2Answer: 280,
    lastResult: null,
    roundNumber: 3,
    reviveUsed: [false, false],
  }

  it('revive in a non-victory phase is a no-op', () => {
    const state: MatchState = { ...victoryState, phase: 'reveal' }
    const next = matchReducer(state, {
      type: 'REVIVE',
      player: 1,
      target: 77,
    })
    expect(next).toBe(state)
  })

  it('revive when the player still has hp is a no-op', () => {
    const state: MatchState = {
      ...victoryState,
      players: [victoryState.players[0], { ...victoryState.players[1], hp: 5 }],
    }
    const next = matchReducer(state, {
      type: 'REVIVE',
      player: 1,
      target: 77,
    })
    expect(next).toBe(state)
  })

  it('revive when the player already used their revive is a no-op (re-defeat after a legal revive)', () => {
    // Simulates: player 1 was revived once, fought on, and was defeated again.
    const state: MatchState = {
      ...victoryState,
      reviveUsed: [false, true],
    }
    const next = matchReducer(state, {
      type: 'REVIVE',
      player: 1,
      target: 77,
    })
    expect(next).toBe(state)
  })

  it('legal revive: hp -> 40, phase -> p1-turn, fresh round, reviveUsed set, both players wins/multiplier preserved', () => {
    const next = matchReducer(victoryState, {
      type: 'REVIVE',
      player: 1,
      target: 77,
    })
    expect(next.phase).toBe('p1-turn')
    expect(next.target).toBe(77)
    expect(next.players[1].hp).toBe(SECOND_WIND_HP)
    expect(next.players[1].wins).toBe(victoryState.players[1].wins)
    expect(next.players[1].multiplier).toBe(victoryState.players[1].multiplier)
    expect(next.players[0]).toEqual(victoryState.players[0])
    expect(next.p1Answer).toBeNull()
    expect(next.p2Answer).toBeNull()
    expect(next.lastResult).toBeNull()
    expect(next.roundNumber).toBe(victoryState.roundNumber + 1)
    expect(next.reviveUsed).toEqual([false, true])
  })

  it('START_MATCH resets reviveUsed to [false, false]', () => {
    const used: MatchState = { ...victoryState, reviveUsed: [true, true] }
    const next = matchReducer(used, {
      type: 'START_MATCH',
      mode: 'tap',
      target: 50,
    })
    expect(next.reviveUsed).toEqual([false, false])
  })

  it('REMATCH resets reviveUsed to [false, false]', () => {
    const used: MatchState = { ...victoryState, reviveUsed: [true, true] }
    const next = matchReducer(used, { type: 'REMATCH', target: 50 })
    expect(next.reviveUsed).toEqual([false, false])
  })

  it('non-revive actions carry reviveUsed forward unchanged', () => {
    const used: MatchState = {
      ...victoryState,
      phase: 'p2-turn',
      reviveUsed: [false, true],
    }
    const next = matchReducer(used, { type: 'SUBMIT', answer: 120 })
    expect(next.reviveUsed).toEqual([false, true])
  })

  it('hook: revive(player) drives player 0 from a real defeat back into p1-turn', async () => {
    // rng = 0.5 -> target 120. p1 submits 280 (clamped distance 160), p2
    // submits 120 (perfect) -> p2 wins, damage 160 = STARTING_HP -> p1 (0) defeated.
    const { result } = await renderHook(() => useDuelMatch(rng))
    await act(() => result.current.startMatch('tap'))
    await act(() => result.current.submit(280))
    await act(() => result.current.submit(120))
    expect(result.current.state.phase).toBe('victory')
    expect(result.current.state.players[0].hp).toBe(0)

    await act(() => result.current.revive(0))

    expect(result.current.state.phase).toBe('p1-turn')
    expect(result.current.state.players[0].hp).toBe(SECOND_WIND_HP)
    expect(result.current.state.reviveUsed).toEqual([true, false])
  })
})
