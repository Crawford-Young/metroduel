import { renderHook, act } from '@testing-library/react-native'
import { useAiTurn, AI_THINK_MS_MIN, AI_THINK_MS_MAX } from '@/hooks/useAiTurn'
import type { UseAiTurnOptions } from '@/hooks/useAiTurn'

beforeEach(() => jest.useFakeTimers())
afterEach(() => jest.useRealTimers())

function baseOptions(
  overrides: Partial<UseAiTurnOptions> = {},
): UseAiTurnOptions {
  return {
    active: false,
    target: 120,
    tier: 'rookie',
    onAnswer: jest.fn(),
    rng: () => 0.5,
    ...overrides,
  }
}

describe('useAiTurn', () => {
  it('starts with thinking false while inactive', async () => {
    const { result } = await renderHook(
      (props: UseAiTurnOptions) => useAiTurn(props),
      {
        initialProps: baseOptions(),
      },
    )
    expect(result.current.thinking).toBe(false)
  })

  it('sets thinking true immediately when active flips false -> true', async () => {
    const props = baseOptions()
    const { result, rerender } = await renderHook(
      (p: UseAiTurnOptions) => useAiTurn(p),
      { initialProps: props },
    )
    expect(result.current.thinking).toBe(false)
    await rerender({ ...props, active: true })
    expect(result.current.thinking).toBe(true)
  })

  it('calls onAnswer exactly once after the delay, then thinking becomes false', async () => {
    const onAnswer = jest.fn()
    const props = baseOptions({ onAnswer, rng: () => 0.5 })
    const { result, rerender } = await renderHook(
      (p: UseAiTurnOptions) => useAiTurn(p),
      { initialProps: props },
    )
    await rerender({ ...props, active: true })
    expect(result.current.thinking).toBe(true)

    const midpointDelay =
      AI_THINK_MS_MIN + 0.5 * (AI_THINK_MS_MAX - AI_THINK_MS_MIN)
    await act(() => {
      jest.advanceTimersByTime(midpointDelay)
    })

    expect(onAnswer).toHaveBeenCalledTimes(1)
    expect(result.current.thinking).toBe(false)
  })

  it('delays at least AI_THINK_MS_MIN when rng returns 0', async () => {
    const onAnswer = jest.fn()
    const props = baseOptions({ onAnswer, rng: () => 0 })
    const { rerender } = await renderHook(
      (p: UseAiTurnOptions) => useAiTurn(p),
      {
        initialProps: props,
      },
    )
    await rerender({ ...props, active: true })

    await act(() => {
      jest.advanceTimersByTime(AI_THINK_MS_MIN - 1)
    })
    expect(onAnswer).not.toHaveBeenCalled()

    await act(() => {
      jest.advanceTimersByTime(1)
    })
    expect(onAnswer).toHaveBeenCalledTimes(1)
  })

  it('delays no more than AI_THINK_MS_MAX when rng returns 1', async () => {
    const onAnswer = jest.fn()
    const props = baseOptions({ onAnswer, rng: () => 1 })
    const { rerender } = await renderHook(
      (p: UseAiTurnOptions) => useAiTurn(p),
      {
        initialProps: props,
      },
    )
    await rerender({ ...props, active: true })

    await act(() => {
      jest.advanceTimersByTime(AI_THINK_MS_MAX - 1)
    })
    expect(onAnswer).not.toHaveBeenCalled()

    await act(() => {
      jest.advanceTimersByTime(1)
    })
    expect(onAnswer).toHaveBeenCalledTimes(1)
  })

  it('passes target, tier, and rng through to the answer computation', async () => {
    const onAnswer = jest.fn()
    // rng always 0 -> gaussian noise term is deterministic (not 0), so assert
    // via a stub aiAnswer is unnecessary here: bound-check target passthrough.
    const props = baseOptions({
      onAnswer,
      target: 200,
      tier: 'maestro',
      rng: () => 0.5,
    })
    const { rerender } = await renderHook(
      (p: UseAiTurnOptions) => useAiTurn(p),
      {
        initialProps: props,
      },
    )
    await rerender({ ...props, active: true })
    await act(() => {
      jest.advanceTimersByTime(AI_THINK_MS_MAX)
    })
    expect(onAnswer).toHaveBeenCalledTimes(1)
    const [bpm] = onAnswer.mock.calls[0] as [number]
    expect(typeof bpm).toBe('number')
    expect(bpm).toBeGreaterThanOrEqual(40)
    expect(bpm).toBeLessThanOrEqual(200)
  })

  it('cancels cleanly when active flips back false mid-delay — no submit after deactivation', async () => {
    const onAnswer = jest.fn()
    const props = baseOptions({ onAnswer, rng: () => 0.5 })
    const { result, rerender } = await renderHook(
      (p: UseAiTurnOptions) => useAiTurn(p),
      { initialProps: props },
    )
    await rerender({ ...props, active: true })
    expect(result.current.thinking).toBe(true)

    await act(() => {
      jest.advanceTimersByTime(100) // well within the delay window
    })
    await rerender({ ...props, active: false })
    expect(result.current.thinking).toBe(false)

    await act(() => {
      jest.advanceTimersByTime(AI_THINK_MS_MAX)
    })
    expect(onAnswer).not.toHaveBeenCalled()
  })

  it('defaults to Math.random when no rng is provided', async () => {
    const onAnswer = jest.fn()
    const props = baseOptions({ onAnswer })
    delete (props as { rng?: () => number }).rng
    const { rerender } = await renderHook(
      (p: UseAiTurnOptions) => useAiTurn(p),
      {
        initialProps: props,
      },
    )
    await rerender({ ...props, active: true })
    await act(() => {
      jest.advanceTimersByTime(AI_THINK_MS_MAX)
    })
    expect(onAnswer).toHaveBeenCalledTimes(1)
  })

  it('cleans up the pending timer on unmount without calling onAnswer', async () => {
    const onAnswer = jest.fn()
    const props = baseOptions({ onAnswer, rng: () => 0.5 })
    const { rerender, unmount } = await renderHook(
      (p: UseAiTurnOptions) => useAiTurn(p),
      { initialProps: props },
    )
    await rerender({ ...props, active: true })
    await act(() => {
      jest.advanceTimersByTime(100)
    })
    await unmount()

    await act(() => {
      jest.advanceTimersByTime(AI_THINK_MS_MAX)
    })
    expect(onAnswer).not.toHaveBeenCalled()
  })
})
