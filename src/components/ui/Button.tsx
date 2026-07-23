import { ReactElement } from 'react'
import { Pressable, StyleSheet, Text } from 'react-native'

import { Colors, Radius, Spacing, Typography } from '@/theme/tokens'

export type ButtonVariant = 'primary' | 'secondary' | 'danger'

export interface ButtonProps {
  readonly label: string
  readonly onPress: () => void
  readonly variant?: ButtonVariant
}

const DEFAULT_VARIANT: ButtonVariant = 'primary'

const VARIANT_BACKGROUND: Record<ButtonVariant, string> = {
  primary: Colors.accent,
  secondary: Colors.surfaceRaised,
  danger: Colors.danger,
}

const VARIANT_TEXT_COLOR: Record<ButtonVariant, string> = {
  primary: Colors.accentForeground,
  secondary: Colors.textPrimary,
  danger: Colors.dangerForeground,
}

export function Button({
  label,
  onPress,
  variant = DEFAULT_VARIANT,
}: ButtonProps): ReactElement {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.base, { backgroundColor: VARIANT_BACKGROUND[variant] }]}
    >
      <Text style={[styles.label, { color: VARIANT_TEXT_COLOR[variant] }]}>
        {label}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: Typography.body.fontSize,
    fontWeight: Typography.label.fontWeight,
  },
})
