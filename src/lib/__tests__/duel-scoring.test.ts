import {
  randomTarget,
  clampDistance,
  initialPlayer,
  resolveRound,
} from '@/lib/duel/scoring'
import {
  MIN_TARGET_BPM,
  MAX_TARGET_BPM,
  STARTING_HP,
  type DuelPlayer,
} from '@/lib/duel/types'

const pair = (): readonly [DuelPlayer, DuelPlayer] => [
  initialPlayer(),
  initialPlayer(),
]

describe('randomTarget', () => {
  it('rng=0 -> MIN, rng=1 -> MAX', () => {
    expect(randomTarget(() => 0)).toBe(MIN_TARGET_BPM)
    expect(randomTarget(() => 1)).toBe(MAX_TARGET_BPM)
  })
  it('rng=0.5 -> midpoint 120', () => {
    expect(randomTarget(() => 0.5)).toBe(120)
  })
  it('defaults to Math.random and stays in range', () => {
    const t = randomTarget()
    expect(t).toBeGreaterThanOrEqual(MIN_TARGET_BPM)
    expect(t).toBeLessThanOrEqual(MAX_TARGET_BPM)
  })
})

describe('clampDistance', () => {
  it('absolute difference', () => {
    expect(clampDistance(130, 120)).toBe(10)
    expect(clampDistance(110, 120)).toBe(10)
  })
  it('caps at MAX_DISTANCE 160', () => {
    expect(clampDistance(1000, 120)).toBe(160)
  })
})

describe('initialPlayer', () => {
  it('starts full HP, no wins, x1', () => {
    expect(initialPlayer()).toEqual({ hp: STARTING_HP, wins: 0, multiplier: 1 })
  })
})

describe('resolveRound', () => {
  it('closer answer wins; loser takes (gap * x1) on first win', () => {
    const { players, result } = resolveRound({
      target: 120,
      p1Answer: 120,
      p2Answer: 140,
      players: pair(),
    })
    expect(result.winner).toBe(0)
    expect(result.damage).toBe(20)
    expect(result.gap).toBe(20)
    expect(result.multiplier).toBe(1)
    expect(result.damage).toBe(result.gap * result.multiplier)
    expect(players[0]).toEqual({ hp: STARTING_HP, wins: 1, multiplier: 2 })
    expect(players[1].hp).toBe(STARTING_HP - 20)
    expect(players[1].wins).toBe(0)
    expect(players[1].multiplier).toBe(1)
    expect(result.defeated).toBe(false)
  })

  it('player 2 can win', () => {
    const { players, result } = resolveRound({
      target: 100,
      p1Answer: 130,
      p2Answer: 105,
      players: pair(),
    })
    expect(result.winner).toBe(1)
    expect(result.damage).toBe(25)
    expect(players[1]).toEqual({ hp: STARTING_HP, wins: 1, multiplier: 2 })
    expect(players[0].hp).toBe(STARTING_HP - 25)
  })

  it('tie is a wash: no damage, no win/multiplier change', () => {
    const { players, result } = resolveRound({
      target: 120,
      p1Answer: 110,
      p2Answer: 130,
      players: pair(),
    })
    expect(result.winner).toBeNull()
    expect(result.damage).toBe(0)
    expect(result.gap).toBe(0)
    expect(result.multiplier).toBe(0)
    expect(players[0]).toEqual(initialPlayer())
    expect(players[1]).toEqual(initialPlayer())
  })

  it('multiplier scales damage on later wins', () => {
    const start: readonly [DuelPlayer, DuelPlayer] = [
      { hp: STARTING_HP, wins: 2, multiplier: 3 },
      { hp: STARTING_HP, wins: 0, multiplier: 1 },
    ]
    const { players, result } = resolveRound({
      target: 120,
      p1Answer: 120,
      p2Answer: 130,
      players: start,
    })
    expect(result.damage).toBe(30)
    expect(result.gap).toBe(10)
    expect(result.multiplier).toBe(3)
    expect(players[0].multiplier).toBe(4)
    expect(players[1].hp).toBe(STARTING_HP - 30)
  })

  it('HP floors at 0 and flags defeated', () => {
    const start: readonly [DuelPlayer, DuelPlayer] = [
      { hp: STARTING_HP, wins: 0, multiplier: 1 },
      { hp: 10, wins: 0, multiplier: 1 },
    ]
    const { players, result } = resolveRound({
      target: 40,
      p1Answer: 40,
      p2Answer: 200,
      players: start,
    })
    expect(players[1].hp).toBe(0)
    expect(result.defeated).toBe(true)
  })

  it('HP clamp floors a would-be-negative result', () => {
    const start: readonly [DuelPlayer, DuelPlayer] = [
      { hp: 160, wins: 0, multiplier: 1 },
      { hp: 10, wins: 0, multiplier: 1 },
    ]
    const { players, result } = resolveRound({
      target: 120,
      p1Answer: 120,
      p2Answer: 150,
      players: start,
    })
    expect(players[1].hp).toBe(0)
    expect(result.defeated).toBe(true)
  })
})
