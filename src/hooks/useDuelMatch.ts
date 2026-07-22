// ported from instrumenttuner@7156e04
import { useCallback, useReducer } from 'react'
import { randomTarget, initialPlayer, resolveRound } from '@/lib/duel/scoring'
import type { DuelMode, DuelState } from '@/lib/duel/types'

type Action =
  | { type: 'START_MATCH'; mode: DuelMode; target: number }
  | { type: 'SUBMIT'; answer: number }
  | { type: 'NEXT_ROUND'; target: number }
  | { type: 'REMATCH'; target: number }

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

export interface DuelMatch {
  readonly state: DuelState
  readonly startMatch: (mode: DuelMode) => void
  readonly submit: (answer: number) => void
  readonly nextRound: () => void
  readonly rematch: () => void
}

export function useDuelMatch(rng: () => number = Math.random): DuelMatch {
  const [state, dispatch] = useReducer(duelReducer, SETUP_STATE)

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

  return { state, startMatch, submit, nextRound, rematch }
}
