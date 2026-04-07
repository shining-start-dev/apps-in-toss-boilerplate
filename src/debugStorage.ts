import { Storage } from '@apps-in-toss/web-framework'
import { AUTH_TOKEN_STORAGE_KEY } from './auth'
import { DEBUG_RUNTIME_MODE_STORAGE_KEY } from './debugRuntimeMode'

export type DebugStorageEntry = {
  key: string
  localValue: string | null
  bridgeValue: string | null
}

export const DEBUG_STORAGE_KEYS = [AUTH_TOKEN_STORAGE_KEY, DEBUG_RUNTIME_MODE_STORAGE_KEY] as const

async function readBridgeValue(key: string) {
  try {
    const value = await Storage.getItem(key)
    return typeof value === 'string' ? value : null
  } catch {
    return null
  }
}

function readLocalValue(key: string) {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

async function removeBridgeValue(key: string) {
  try {
    await Storage.removeItem(key)
    return true
  } catch {
    return false
  }
}

function removeLocalValue(key: string) {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    window.localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}

export async function getDebugStorageEntries() {
  return Promise.all(
    DEBUG_STORAGE_KEYS.map(async (key): Promise<DebugStorageEntry> => ({
      key,
      localValue: readLocalValue(key),
      bridgeValue: await readBridgeValue(key),
    })),
  )
}

export async function clearDebugStorageKey(key: string) {
  const localSuccess = removeLocalValue(key)
  const bridgeSuccess = await removeBridgeValue(key)

  if (!localSuccess && !bridgeSuccess) {
    throw new Error(`스토리지 키를 삭제하지 못했어요. (${key})`)
  }
}

export async function clearAllDebugStorage() {
  for (const key of DEBUG_STORAGE_KEYS) {
    await clearDebugStorageKey(key)
  }
}
