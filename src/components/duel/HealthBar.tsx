// ported from instrumenttuner@7156e04 (semantics only — native styling/animation are new)
import { ReactElement, useEffect, useRef } from 'react'
import { Animated, StyleSheet, Text, View } from 'react-native'

import { Colors, Radius, Spacing, Typography } from '@/theme/tokens'

const HEALTH_DRAIN_DURATION_MS = 300
const MIN_PERCENT = 0
const FULL_PERCENT = 100

export interface HealthBarProps {
  readonly label: string
  readonly hp: number
  readonly maxHp: number
}

function clampPercent(hp: number, maxHp: number): number {
  return Math.max(
    MIN_PERCENT,
    Math.min(FULL_PERCENT, (hp / maxHp) * FULL_PERCENT),
  )
}

export function HealthBar({ label, hp, maxHp }: HealthBarProps): ReactElement {
  const percent = clampPercent(hp, maxHp)
  // Intentional: Animated.Value is a mutable escape hatch designed to be read
  // during render (that's how RN wires it into JSX style props) — it never
  // triggers a React re-render itself, so react-hooks/refs's render-purity
  // concern does not apply here.
  // eslint-disable-next-line react-hooks/refs
  const widthAnim = useRef(new Animated.Value(percent)).current

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: percent,
      duration: HEALTH_DRAIN_DURATION_MS,
      useNativeDriver: false,
    }).start()
  }, [percent, widthAnim])

  // Intentional: same Animated escape-hatch read as widthAnim above — calling
  // .interpolate() only derives a style value from the Animated.Value, it
  // never reads/writes React state during render.
  // eslint-disable-next-line react-hooks/refs
  const fillWidth = widthAnim.interpolate({
    inputRange: [MIN_PERCENT, FULL_PERCENT],
    outputRange: ['0%', '100%'],
  })

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.hpValue}>{hp}</Text>
      </View>
      <View
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={`${label} health ${hp} of ${maxHp}`}
        style={styles.track}
      >
        <Animated.View
          testID="health-fill"
          style={[styles.fill, { width: fillWidth }]}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: Spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  label: {
    fontSize: Typography.label.fontSize,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  hpValue: {
    fontSize: Typography.label.fontSize,
    color: Colors.textSecondary,
  },
  track: {
    height: Spacing.md,
    width: '100%',
    borderRadius: Radius.full,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceRaised,
  },
  fill: {
    height: '100%',
    borderRadius: Radius.full,
    backgroundColor: Colors.accent,
  },
})
