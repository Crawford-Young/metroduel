// ported from instrumenttuner@7156e04
import {
  MIN_TARGET_BPM,
  MAX_TARGET_BPM,
  MAX_DISTANCE,
  STARTING_HP,
  type DuelPlayer,
  type PlayerIndex,
  type RoundResult,
} from './types'

export function randomTarget(rng: () => number = Math.random): number {
  return MIN_TARGET_BPM + Math.round(rng() * (MAX_TARGET_BPM - MIN_TARGET_BPM))
}

export function clampDistance(answer: number, target: number): number {
  return Math.min(MAX_DISTANCE, Math.abs(answer - target))
}

export function initialPlayer(): DuelPlayer {
  return { hp: STARTING_HP, wins: 0, multiplier: 1 }
}

export interface ResolveInput {
  readonly target: number
  readonly p1Answer: number
  readonly p2Answer: number
  readonly players: readonly [DuelPlayer, DuelPlayer]
}

export interface ResolveOutput {
  readonly players: readonly [DuelPlayer, DuelPlayer]
  readonly result: RoundResult
}

export function resolveRound(input: ResolveInput): ResolveOutput {
  const { target, p1Answer, p2Answer, players } = input
  const p1Distance = clampDistance(p1Answer, target)
  const p2Distance = clampDistance(p2Answer, target)

  if (p1Distance === p2Distance) {
    return {
      players,
      result: {
        target,
        p1Answer,
        p2Answer,
        p1Distance,
        p2Distance,
        winner: null,
        gap: 0,
        multiplier: 0,
        damage: 0,
        defeated: false,
      },
    }
  }

  const winner: PlayerIndex = p1Distance < p2Distance ? 0 : 1
  const winnerDist = winner === 0 ? p1Distance : p2Distance
  const loserDist = winner === 0 ? p2Distance : p1Distance

  const winnerPlayer = players[winner]
  const loserPlayer = players[winner === 0 ? 1 : 0]

  const gap = loserDist - winnerDist
  const damage = gap * winnerPlayer.multiplier
  const loserHp = Math.max(0, loserPlayer.hp - damage)
  const newWins = winnerPlayer.wins + 1

  const updatedWinner: DuelPlayer = {
    hp: winnerPlayer.hp,
    wins: newWins,
    multiplier: 1 + newWins,
  }
  const updatedLoser: DuelPlayer = {
    hp: loserHp,
    wins: loserPlayer.wins,
    multiplier: loserPlayer.multiplier,
  }

  const newPlayers: readonly [DuelPlayer, DuelPlayer] =
    winner === 0 ? [updatedWinner, updatedLoser] : [updatedLoser, updatedWinner]

  return {
    players: newPlayers,
    result: {
      target,
      p1Answer,
      p2Answer,
      p1Distance,
      p2Distance,
      winner,
      gap,
      multiplier: winnerPlayer.multiplier,
      damage,
      defeated: loserHp === 0,
    },
  }
}
