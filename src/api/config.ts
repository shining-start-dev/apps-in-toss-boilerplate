import {
  getResolvedOperationalEnvironment,
  getResolvedRuntimeMode,
  readDebugRuntimeMode,
} from '../debugRuntimeMode'
import { getEnvString } from '../utils/env'

export function normalizeBaseUrl(baseUrl: string) {
  if (baseUrl.length === 0) {
    return ''
  }

  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
}

function getAutoBaseUrl() {
  const configuredBaseUrl = getEnvString(
    import.meta.env.VITE_AIP_SERVER_BASE_URL ?? import.meta.env.VITE_API_BASE_URL,
  )

  if (configuredBaseUrl.length > 0) {
    return normalizeBaseUrl(configuredBaseUrl)
  }

  if (import.meta.env.DEV && getResolvedOperationalEnvironment() === 'local') {
    return ''
  }

  return ''
}

function getForcedBaseUrl() {
  const debugRuntimeMode = readDebugRuntimeMode()

  if (debugRuntimeMode === 'live') {
    return normalizeBaseUrl(getEnvString(import.meta.env.VITE_PROD_API_BASE_URL))
  }

  if (debugRuntimeMode === 'dev') {
    return normalizeBaseUrl(getEnvString(import.meta.env.VITE_DEV_API_BASE_URL))
  }

  const resolvedRuntimeMode = getResolvedRuntimeMode()
  if (resolvedRuntimeMode === 'live') {
    return normalizeBaseUrl(getEnvString(import.meta.env.VITE_PROD_API_BASE_URL))
  }

  return normalizeBaseUrl(getEnvString(import.meta.env.VITE_DEV_API_BASE_URL))
}

export function toServerRequestUrl(path: string) {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  const forcedBaseUrl = getForcedBaseUrl()
  const baseUrl = forcedBaseUrl || getAutoBaseUrl()

  if (baseUrl.length === 0) {
    return path
  }

  if (path.startsWith('/')) {
    return `${baseUrl}${path}`
  }

  return `${baseUrl}/${path}`
}
