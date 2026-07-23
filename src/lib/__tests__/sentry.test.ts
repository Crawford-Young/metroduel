import * as Sentry from '@sentry/react-native'

import { initSentry } from '@/lib/sentry'

jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
}))

describe('initSentry', () => {
  const originalDsn = process.env.EXPO_PUBLIC_SENTRY_DSN

  afterEach(() => {
    process.env.EXPO_PUBLIC_SENTRY_DSN = originalDsn
    jest.clearAllMocks()
  })

  it('returns false and never calls Sentry.init when the DSN is an empty string', () => {
    process.env.EXPO_PUBLIC_SENTRY_DSN = ''

    expect(initSentry()).toBe(false)
    expect(Sentry.init).not.toHaveBeenCalled()
  })

  it('returns false and never calls Sentry.init when the DSN is undefined', () => {
    delete process.env.EXPO_PUBLIC_SENTRY_DSN

    expect(initSentry()).toBe(false)
    expect(Sentry.init).not.toHaveBeenCalled()
  })

  it('calls Sentry.init with the dsn and returns true when the DSN is set', () => {
    process.env.EXPO_PUBLIC_SENTRY_DSN =
      'https://examplePublicKey@o0.ingest.sentry.io/0'

    expect(initSentry()).toBe(true)
    expect(Sentry.init).toHaveBeenCalledWith({
      dsn: 'https://examplePublicKey@o0.ingest.sentry.io/0',
      tracesSampleRate: 1.0,
      enableAutoSessionTracking: true,
    })
  })
})
