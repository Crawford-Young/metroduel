/* eslint-disable @typescript-eslint/no-require-imports -- CJS require() is used
   deliberately so jest.resetModules() can force a fresh module instance per
   test, simulating an app restart to verify MMKV rehydration; dynamic
   import() is not usable here without --experimental-vm-modules. */

const mockStorageMap = new Map<string, string>()

jest.mock('react-native-mmkv', () => ({
  createMMKV: jest.fn(() => ({
    getString: (key: string) => mockStorageMap.get(key),
    set: (key: string, value: string) => {
      mockStorageMap.set(key, value)
    },
    clearAll: () => {
      mockStorageMap.clear()
    },
  })),
}))

beforeEach(() => {
  mockStorageMap.clear()
  jest.resetModules()
})

describe('useSettingsStore', () => {
  it('defaults soundEnabled and hapticsEnabled to true when nothing is persisted', () => {
    const { useSettingsStore } =
      require('@/stores/useSettingsStore') as typeof import('@/stores/useSettingsStore')
    const state = useSettingsStore.getState()
    expect(state.soundEnabled).toBe(true)
    expect(state.hapticsEnabled).toBe(true)
  })

  it('falls back to defaults when the persisted settings JSON is corrupt', () => {
    mockStorageMap.set('metroduel-settings', 'not-json{{{')
    const { useSettingsStore } =
      require('@/stores/useSettingsStore') as typeof import('@/stores/useSettingsStore')
    const state = useSettingsStore.getState()
    expect(state.soundEnabled).toBe(true)
    expect(state.hapticsEnabled).toBe(true)
  })

  it('toggleSound flips soundEnabled and leaves hapticsEnabled untouched', () => {
    const { useSettingsStore } =
      require('@/stores/useSettingsStore') as typeof import('@/stores/useSettingsStore')
    useSettingsStore.getState().toggleSound()
    expect(useSettingsStore.getState().soundEnabled).toBe(false)
    expect(useSettingsStore.getState().hapticsEnabled).toBe(true)
  })

  it('toggleHaptics flips hapticsEnabled and leaves soundEnabled untouched', () => {
    const { useSettingsStore } =
      require('@/stores/useSettingsStore') as typeof import('@/stores/useSettingsStore')
    useSettingsStore.getState().toggleHaptics()
    expect(useSettingsStore.getState().hapticsEnabled).toBe(false)
    expect(useSettingsStore.getState().soundEnabled).toBe(true)
  })

  it('persists toggles across a simulated app restart (module re-init)', () => {
    const { useSettingsStore: firstInstance } =
      require('@/stores/useSettingsStore') as typeof import('@/stores/useSettingsStore')
    firstInstance.getState().toggleSound()
    firstInstance.getState().toggleHaptics()

    jest.resetModules()

    const { useSettingsStore: secondInstance } =
      require('@/stores/useSettingsStore') as typeof import('@/stores/useSettingsStore')
    expect(secondInstance.getState().soundEnabled).toBe(false)
    expect(secondInstance.getState().hapticsEnabled).toBe(false)
  })
})
