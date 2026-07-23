import { Text } from 'react-native'
import { render, screen } from '@testing-library/react-native'

import { Screen } from '@/components/ui/Screen'
import { Colors } from '@/theme/tokens'

describe('Screen', () => {
  it('renders its children', async () => {
    await render(
      <Screen>
        <Text>duel content</Text>
      </Screen>,
    )
    expect(screen.getByText('duel content')).toBeTruthy()
  })

  it('fills the screen with the background token color', async () => {
    await render(
      <Screen>
        <Text>duel content</Text>
      </Screen>,
    )
    const container = screen.getByTestId('screen-container')
    expect(container.props.style).toEqual(
      expect.objectContaining({ backgroundColor: Colors.background }),
    )
  })
})
