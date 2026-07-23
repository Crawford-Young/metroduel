import { render, screen, fireEvent } from '@testing-library/react-native'

import { Button } from '@/components/ui/Button'
import { Colors } from '@/theme/tokens'

describe('Button', () => {
  it('renders the label and exposes the button accessibility role', async () => {
    await render(<Button label="Start Duel" onPress={jest.fn()} />)
    const button = screen.getByRole('button', { name: 'Start Duel' })
    expect(button).toBeTruthy()
  })

  it('calls onPress when pressed', async () => {
    const onPress = jest.fn()
    await render(<Button label="Start Duel" onPress={onPress} />)
    await fireEvent.press(screen.getByRole('button', { name: 'Start Duel' }))
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('defaults to the primary variant background', async () => {
    await render(<Button label="Start Duel" onPress={jest.fn()} />)
    const button = screen.getByRole('button', { name: 'Start Duel' })
    expect(button.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: Colors.accent }),
      ]),
    )
  })

  it('renders the secondary variant background', async () => {
    await render(
      <Button label="Cancel" onPress={jest.fn()} variant="secondary" />,
    )
    const button = screen.getByRole('button', { name: 'Cancel' })
    expect(button.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: Colors.surfaceRaised }),
      ]),
    )
  })

  it('renders the danger variant background', async () => {
    await render(
      <Button label="Forfeit" onPress={jest.fn()} variant="danger" />,
    )
    const button = screen.getByRole('button', { name: 'Forfeit' })
    expect(button.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: Colors.danger }),
      ]),
    )
  })
})
