import * as Sentry from '@sentry/react-native'

/**
 * Initializes Sentry crash reporting, gated on a configured DSN.
 *
 * Reads `EXPO_PUBLIC_SENTRY_DSN` rather than a plain `SENTRY_DSN`: only
 * `EXPO_PUBLIC_`-prefixed vars are inlined by babel-preset-expo's
 * inline-env-vars plugin into the on-device RN bundle at build time. An
 * unprefixed var is never replaced, so it would always read as `undefined`
 * at runtime and the gate would never open even with a real DSN configured.
 *
 * @returns `true` when a DSN was present and `Sentry.init` was called,
 * `false` when the DSN is empty/undefined and `Sentry.init` was never
 * called (crash reporting fully off — no active Sentry code path runs).
 */
export function initSentry(): boolean {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN

  if (!dsn) {
    return false
  }

  Sentry.init({
    dsn,
    tracesSampleRate: 1.0,
    enableAutoSessionTracking: true,
  })

  return true
}
