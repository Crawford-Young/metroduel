// ported from instrumenttuner@7156e04
export const MIN_TARGET_BPM = 40
export const MAX_TARGET_BPM = 200
export const BPM_RANGE = MAX_TARGET_BPM - MIN_TARGET_BPM // 160
export const STARTING_HP = BPM_RANGE // max losable in one round at x1
export const MAX_DISTANCE = BPM_RANGE

export type DuelMode = 'tap' | 'guess'
export type DuelPhase = 'setup' | 'p1-turn' | 'p2-turn' | 'reveal' | 'victory'
export type PlayerIndex = 0 | 1

export interface DuelPlayer {
  readonly hp: number
  readonly wins: number
  readonly multiplier: number
}

export interface RoundResult {
  readonly target: number
  readonly p1Answer: number
  readonly p2Answer: number
  readonly p1Distance: number
  readonly p2Distance: number
  readonly winner: PlayerIndex | null // null = tie
  readonly gap: number // loserDistance - winnerDistance (0 on tie)
  readonly multiplier: number // winner's multiplier applied to damage (0 on tie)
  readonly damage: number // gap * multiplier
  readonly defeated: boolean
}

export interface DuelState {
  readonly phase: DuelPhase
  readonly mode: DuelMode
  readonly target: number
  readonly players: readonly [DuelPlayer, DuelPlayer]
  readonly p1Answer: number | null
  readonly p2Answer: number | null
  readonly lastResult: RoundResult | null
  readonly roundNumber: number
}
