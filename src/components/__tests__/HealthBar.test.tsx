import { Animated } from 'react-native'
import { render, screen } from '@testing-library/react-native'

import { HealthBar } from '@/components/duel/HealthBar'

// Stub the animation start so it never runs a real animation loop past the
// test's act() block (that would emit "not wrapped in act" warnings) — these
// tests assert the animation's TARGET value only, never frame-by-frame state.
let timingSpy: jest.SpyInstance

beforeEach(() => {
  timingSpy = jest.spyOn(Animated, 'timing').mockReturnValue({
    start: jest.fn(),
  } as unknown as Animated.CompositeAnimation)
})

afterEach(() => {
  timingSpy.mockRestore()
})

describe('HealthBar', () => {
  it('renders the label and current hp value', async () => {
    await render(<HealthBar label="P1" hp={80} maxHp={160} />)
    expect(screen.getByText('P1')).toBeTruthy()
    expect(screen.getByText('80')).toBeTruthy()
  })

  it('exposes the exact accessibility label contract', async () => {
    await render(<HealthBar label="P1" hp={80} maxHp={160} />)
    expect(screen.getByLabelText('P1 health 80 of 160')).toBeTruthy()
  })

  it('animates the fill toward the clamped percent for a normal hp value', async () => {
    await render(<HealthBar label="P1" hp={40} maxHp={160} />)
    expect(timingSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ toValue: 25 }),
    )
  })

  it('clamps the animation target to 0 when hp is negative', async () => {
    await render(<HealthBar label="P1" hp={-10} maxHp={160} />)
    expect(timingSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ toValue: 0 }),
    )
  })

  it('clamps the animation target to 100 when hp exceeds maxHp', async () => {
    await render(<HealthBar label="P1" hp={200} maxHp={160} />)
    expect(timingSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ toValue: 100 }),
    )
  })
})
