import { describe, expect, it, vi } from 'vitest'

vi.mock('./debugTools', () => ({
  ENABLE_DEBUG_TOOLS: true,
}))

vi.mock('@apps-in-toss/web-framework', () => ({
  getOperationalEnvironment: vi.fn(() => 'local'),
}))

const {
  getResolvedOperationalEnvironment,
  getResolvedRuntimeMode,
  readDebugRuntimeMode,
  writeDebugRuntimeMode,
} = await import('./debugRuntimeMode')

describe('debugRuntimeMode', () => {
  const storage = new Map<string, string>()

  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: {
      getItem(key: string) {
        return storage.get(key) ?? null
      },
      setItem(key: string, value: string) {
        storage.set(key, value)
      },
      removeItem(key: string) {
        storage.delete(key)
      },
      clear() {
        storage.clear()
      },
    },
  })

  it('stores and reads the selected mode', () => {
    window.localStorage.clear()
    writeDebugRuntimeMode('live')
    expect(readDebugRuntimeMode()).toBe('live')
  })

  it('resolves operational environment from the stored override', () => {
    window.localStorage.clear()
    writeDebugRuntimeMode('dev')
    expect(getResolvedOperationalEnvironment()).toBe('sandbox')
    expect(getResolvedRuntimeMode()).toBe('dev')
  })
})
