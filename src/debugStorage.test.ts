import { beforeEach, describe, expect, it, vi } from 'vitest'

const bridgeStorage = new Map<string, string>()
const localStorageState = new Map<string, string>()

vi.mock('@apps-in-toss/web-framework', () => ({
  Storage: {
    getItem: vi.fn((key: string) => Promise.resolve(bridgeStorage.get(key) ?? null)),
    removeItem: vi.fn((key: string) => {
      bridgeStorage.delete(key)
      return Promise.resolve()
    }),
  },
}))

const {
  DEBUG_STORAGE_KEYS,
  clearAllDebugStorage,
  clearDebugStorageKey,
  getDebugStorageEntries,
} = await import('./debugStorage')

describe('debugStorage', () => {
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: {
      getItem(key: string) {
        return localStorageState.get(key) ?? null
      },
      setItem(key: string, value: string) {
        localStorageState.set(key, value)
      },
      removeItem(key: string) {
        localStorageState.delete(key)
      },
      clear() {
        localStorageState.clear()
      },
    },
  })

  beforeEach(() => {
    bridgeStorage.clear()
    window.localStorage.clear()
  })

  it('reads both local and bridge storage values', async () => {
    window.localStorage.setItem(DEBUG_STORAGE_KEYS[0], 'local-token')
    bridgeStorage.set(DEBUG_STORAGE_KEYS[1], 'bridge-mode')

    await expect(getDebugStorageEntries()).resolves.toEqual([
      {
        key: DEBUG_STORAGE_KEYS[0],
        localValue: 'local-token',
        bridgeValue: null,
      },
      {
        key: DEBUG_STORAGE_KEYS[1],
        localValue: null,
        bridgeValue: 'bridge-mode',
      },
    ])
  })

  it('clears a single key from both storages', async () => {
    window.localStorage.setItem(DEBUG_STORAGE_KEYS[0], 'local-token')
    bridgeStorage.set(DEBUG_STORAGE_KEYS[0], 'bridge-token')

    await clearDebugStorageKey(DEBUG_STORAGE_KEYS[0])

    expect(window.localStorage.getItem(DEBUG_STORAGE_KEYS[0])).toBeNull()
    expect(bridgeStorage.get(DEBUG_STORAGE_KEYS[0])).toBeUndefined()
  })

  it('clears all registered debug storage keys', async () => {
    for (const key of DEBUG_STORAGE_KEYS) {
      window.localStorage.setItem(key, `${key}-local`)
      bridgeStorage.set(key, `${key}-bridge`)
    }

    await clearAllDebugStorage()

    for (const key of DEBUG_STORAGE_KEYS) {
      expect(window.localStorage.getItem(key)).toBeNull()
      expect(bridgeStorage.get(key)).toBeUndefined()
    }
  })
})
