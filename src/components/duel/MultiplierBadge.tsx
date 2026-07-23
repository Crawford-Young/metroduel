import { ReactElement } from 'react'
import { StyleSheet, Text } from 'react-native'

import { Colors } from '@/theme/tokens'

const ACTIVE_MULTIPLIER_THRESHOLD = 1

export interface MultiplierBadgeProps {
  readonly multiplier: number
}

export function MultiplierBadge({
  multiplier,
}: MultiplierBadgeProps): ReactElement {
  const active = multiplier > ACTIVE_MULTIPLIER_THRESHOLD

  return (
    <Text
      style={[
        styles.base,
        { color: active ? Colors.accent : Colors.textSecondary },
      ]}
    >
      {`x${multiplier}`}
    </Text>
  )
}

const styles = StyleSheet.create({
  base: {
    fontWeight: '600',
  },
})
