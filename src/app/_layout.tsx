import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useColorScheme } from 'react-native'

import { AnimatedSplashOverlay } from '@/components/animated-icon'
import AppTabs from '@/components/app-tabs'
import { initSentry } from '@/lib/sentry'

// Task 14: env-gated Sentry init only. No error boundary wrap here — its
// fallback (when unconfigured) renders null on any caught error, a
// behavior change independent of the DSN gate; deferred to Task 11's
// rework of this file. Keep this block minimal and easy to lift out.
initSentry()

SplashScreen.preventAutoHideAsync()

export default function TabLayout() {
  const colorScheme = useColorScheme()
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <AppTabs />
    </ThemeProvider>
  )
}
