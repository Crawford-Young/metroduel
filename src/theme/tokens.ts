// Dark-first theme tokens, derived from the brand doc's dark-mode palette
// (docs/brand/brand-identity.md §2, `.dark` token table). MetroDuel is a
// rhythm-battle game — accent doubles as the "correct hit" / active-multiplier
// color, danger as the "damage" / HP-critical color.

export const Colors = {
  // Zinc near-black core surfaces (brand `--background` / `--surface` / `--surface-raised`)
  background: '#09090b',
  surface: '#18181b',
  surfaceRaised: '#27272a',
  border: '#27272a',
  // Text (brand `--foreground` / `--muted-foreground`)
  textPrimary: '#fafafa',
  textSecondary: '#a1a1aa',
  // Emerald accent family (brand `--accent` / `--accent-hover` / `--accent-foreground`)
  accent: '#10b981',
  accentHover: '#34d399',
  accentForeground: '#000000',
  // Destructive/danger (brand `--destructive` / `--destructive-foreground`)
  danger: '#dc2626',
  dangerForeground: '#fafafa',
} as const

export type ColorToken = keyof typeof Colors

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const

export type SpacingToken = keyof typeof Spacing

export const Radius = {
  sm: 4,
  md: 8,
  lg: 12,
  full: 9999,
} as const

export type RadiusToken = keyof typeof Radius

export const Typography = {
  title: { fontSize: 24, fontWeight: '700' },
  body: { fontSize: 16, fontWeight: '400' },
  label: { fontSize: 14, fontWeight: '600' },
  micro: { fontSize: 12, fontWeight: '500' },
} as const

export type TypographyToken = keyof typeof Typography
