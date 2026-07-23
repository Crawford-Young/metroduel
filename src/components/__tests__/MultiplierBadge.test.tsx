import { render, screen } from '@testing-library/react-native'

import { MultiplierBadge } from '@/components/duel/MultiplierBadge'
import { Colors } from '@/theme/tokens'

describe('MultiplierBadge', () => {
  it('renders the multiplier prefixed with x', async () => {
    await render(<MultiplierBadge multiplier={3} />)
    expect(screen.getByText('x3')).toBeTruthy()
  })

  it('renders x1 in the secondary text color when inactive', async () => {
    await render(<MultiplierBadge multiplier={1} />)
    const node = screen.getByText('x1')
    expect(node.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ color: Colors.textSecondary }),
      ]),
    )
  })

  it('renders an active multiplier in the accent color', async () => {
    await render(<MultiplierBadge multiplier={2} />)
    const node = screen.getByText('x2')
    expect(node.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ color: Colors.accent }),
      ]),
    )
  })
})
