import { getOperationalEnvironment } from '@apps-in-toss/web-framework'
import { ENABLE_DEBUG_TOOLS } from './debugTools'

export const DEBUG_RUNTIME_MODE_STORAGE_KEY = 'ait_boilerplate_debug_runtime_mode'

export type DebugRuntimeMode = 'auto' | 'live' | 'dev'
export type ResolvedOperationalEnvironment = 'toss' | 'sandbox' | 'local'

function isValidDebugRuntimeMode(value: string): value is DebugRuntimeMode {
  return value === 'auto' || value === 'live' || value === 'dev'
}

function getNativeOperationalEnvironment(): ResolvedOperationalEnvironment {
  try {
    const environment = getOperationalEnvironment()
    if (environment === 'toss' || environment === 'sandbox' || environment === 'local') {
      return environment
    }
  } catch {
    // Fall through to local default.
  }

  return 'local'
}

export function readDebugRuntimeMode(): DebugRuntimeMode {
  if (!ENABLE_DEBUG_TOOLS || typeof window === 'undefined') {
    return 'auto'
  }

  try {
    const storedValue = window.localStorage.getItem(DEBUG_RUNTIME_MODE_STORAGE_KEY)
    return storedValue !== null && isValidDebugRuntimeMode(storedValue) ? storedValue : 'auto'
  } catch {
    return 'auto'
  }
}

export function writeDebugRuntimeMode(mode: DebugRuntimeMode) {
  if (!ENABLE_DEBUG_TOOLS || typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(DEBUG_RUNTIME_MODE_STORAGE_KEY, mode)
  } catch {
    // Ignore debug setting write failures.
  }
}

export function getResolvedOperationalEnvironment(): ResolvedOperationalEnvironment {
  const debugRuntimeMode = readDebugRuntimeMode()

  if (debugRuntimeMode === 'live') {
    return 'toss'
  }

  if (debugRuntimeMode === 'dev') {
    return 'sandbox'
  }

  return getNativeOperationalEnvironment()
}

export function getResolvedRuntimeMode() {
  return getResolvedOperationalEnvironment() === 'toss' ? 'live' : 'dev'
}
