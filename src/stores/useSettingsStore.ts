import { create } from 'zustand'
import { z } from 'zod'
import { getJSON, setJSON } from '@/lib/storage'

const SETTINGS_KEY = 'metroduel-settings'

const settingsSchema = z.object({
  soundEnabled: z.boolean(),
  hapticsEnabled: z.boolean(),
})

type PersistedSettings = z.infer<typeof settingsSchema>

const DEFAULT_SETTINGS: PersistedSettings = {
  soundEnabled: true,
  hapticsEnabled: true,
}

export interface SettingsState extends PersistedSettings {
  toggleSound: () => void
  toggleHaptics: () => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  ...getJSON(SETTINGS_KEY, settingsSchema, DEFAULT_SETTINGS),
  toggleSound: () => {
    set((state) => {
      const next: PersistedSettings = {
        soundEnabled: !state.soundEnabled,
        hapticsEnabled: state.hapticsEnabled,
      }
      setJSON(SETTINGS_KEY, next)
      return next
    })
  },
  toggleHaptics: () => {
    set((state) => {
      const next: PersistedSettings = {
        soundEnabled: state.soundEnabled,
        hapticsEnabled: !state.hapticsEnabled,
      }
      setJSON(SETTINGS_KEY, next)
      return next
    })
  },
}))
