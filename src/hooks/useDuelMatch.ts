// ported from instrumenttuner@7156e04 — diverges: Second Wind REVIVE action (see CLAUDE.md)
import { useCallback, useReducer } from 'react'
import { randomTarget, initialPlayer, resolveRound } from '@/lib/duel/scoring'
import type {
  DuelMode,
  DuelPlayer,
  DuelState,
  PlayerIndex,
} from '@/lib/duel/types'

export const SECOND_WIND_HP = 40

type Action =
  | { type: 'START_MATCH'; mode: DuelMode; target: number }
  | { type: 'SUBMIT'; answer: number }
  | { type: 'NEXT_ROUND'; target: number }
  | { type: 'REMATCH'; target: number }

type MatchAction =
  Action | { type: 'REVIVE'; player: PlayerIndex; target: number }

export interface MatchState extends DuelState {
  readonly reviveUsed: readonly [boolean, boolean]
}

function freshMatch(mode: DuelMode, target: number): DuelState {
  return {
    phase: 'p1-turn',
    mode,
    target,
    players: [initialPlayer(), initialPlayer()],
    p1Answer: null,
    p2Answer: null,
    lastResult: null,
    roundNumber: 1,
  }
}

const SETUP_STATE: DuelState = {
  phase: 'setup',
  mode: 'tap',
  target: 0,
  players: [initialPlayer(), initialPlayer()],
  p1Answer: null,
  p2Answer: null,
  lastResult: null,
  roundNumber: 0,
}

const MATCH_SETUP_STATE: MatchState = {
  ...SETUP_STATE,
  reviveUsed: [false, false],
}

export function duelReducer(state: DuelState, action: Action): DuelState {
  switch (action.type) {
    case 'START_MATCH':
      return freshMatch(action.mode, action.target)

    case 'SUBMIT': {
      if (state.phase === 'p1-turn') {
        return { ...state, phase: 'p2-turn', p1Answer: action.answer }
      }
      if (state.phase === 'p2-turn' && state.p1Answer !== null) {
        const { players, result } = resolveRound({
          target: state.target,
          p1Answer: state.p1Answer,
          p2Answer: action.answer,
          players: state.players,
        })
        return {
          ...state,
          phase: result.defeated ? 'victory' : 'reveal',
          p2Answer: action.answer,
          players,
          lastResult: result,
        }
      }
      return state
    }

    case 'NEXT_ROUND':
      return {
        ...state,
        phase: 'p1-turn',
        target: action.target,
        p1Answer: null,
        p2Answer: null,
        lastResult: null,
        roundNumber: state.roundNumber + 1,
      }

    case 'REMATCH':
      return freshMatch(state.mode, action.target)

    default:
      return state
  }
}

// Wrapper reducer: composes around the ported `duelReducer` above (which stays
// byte-identical) to add the Second Wind REVIVE action and the `reviveUsed`
// state extension. Non-REVIVE actions delegate to `duelReducer` and carry
// `reviveUsed` forward, except START_MATCH/REMATCH which reset it — a fresh
// match or rematch grants both players their revive back.
export function matchReducer(
  state: MatchState,
  action: MatchAction,
): MatchState {
  if (action.type === 'REVIVE') {
    const { player } = action
    if (
      state.phase !== 'victory' ||
      state.players[player].hp !== 0 ||
      state.reviveUsed[player]
    ) {
      return state
    }

    const players: readonly [DuelPlayer, DuelPlayer] = [
      player === 0
        ? { ...state.players[0], hp: SECOND_WIND_HP }
        : state.players[0],
      player === 1
        ? { ...state.players[1], hp: SECOND_WIND_HP }
        : state.players[1],
    ]
    const reviveUsed: readonly [boolean, boolean] = [
      player === 0 ? true : state.reviveUsed[0],
      player === 1 ? true : state.reviveUsed[1],
    ]

    return {
      ...state,
      phase: 'p1-turn',
      target: action.target,
      players,
      p1Answer: null,
      p2Answer: null,
      lastResult: null,
      roundNumber: state.roundNumber + 1,
      reviveUsed,
    }
  }

  const next = duelReducer(state, action)
  const reviveUsed: readonly [boolean, boolean] =
    action.type === 'START_MATCH' || action.type === 'REMATCH'
      ? [false, false]
      : state.reviveUsed

  return { ...next, reviveUsed }
}

export interface DuelMatch {
  readonly state: MatchState
  readonly startMatch: (mode: DuelMode) => void
  readonly submit: (answer: number) => void
  readonly nextRound: () => void
  readonly rematch: () => void
  readonly revive: (player: PlayerIndex) => void
}

export function useDuelMatch(rng: () => number = Math.random): DuelMatch {
  const [state, dispatch] = useReducer(matchReducer, MATCH_SETUP_STATE)

  const startMatch = useCallback(
    (mode: DuelMode) =>
      dispatch({ type: 'START_MATCH', mode, target: randomTarget(rng) }),
    [rng],
  )
  const submit = useCallback(
    (answer: number) => dispatch({ type: 'SUBMIT', answer }),
    [],
  )
  const nextRound = useCallback(
    () => dispatch({ type: 'NEXT_ROUND', target: randomTarget(rng) }),
    [rng],
  )
  const rematch = useCallback(
    () => dispatch({ type: 'REMATCH', target: randomTarget(rng) }),
    [rng],
  )
  const revive = useCallback(
    (player: PlayerIndex) =>
      dispatch({ type: 'REVIVE', player, target: randomTarget(rng) }),
    [rng],
  )

  return { state, startMatch, submit, nextRound, rematch, revive }
}
