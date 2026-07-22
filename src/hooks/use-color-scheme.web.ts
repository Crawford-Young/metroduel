import { useEffect, useState } from 'react'
import { useColorScheme as useRNColorScheme } from 'react-native'

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false)

  useEffect(() => {
    // Intentional: flip a one-time hydration flag so web static rendering
    // recalculates the color scheme on the client. The single setState runs
    // once on mount and cannot cascade.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasHydrated(true)
  }, [])

  const colorScheme = useRNColorScheme()

  if (hasHydrated) {
    return colorScheme
  }

  return 'light'
}
