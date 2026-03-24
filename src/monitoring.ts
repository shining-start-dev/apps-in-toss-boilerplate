import * as Sentry from '@sentry/react'
import { env as bridgeEnv, getOperationalEnvironment } from '@apps-in-toss/web-framework'
import { getEnvString } from './utils/env'

type ErrorContext = {
  scope: string
  extra?: Record<string, unknown>
}

let initialized = false
let sentryEnabled = false
let initializationRetryTimer: number | null = null
let initializationRetryCount = 0

const MONITORING_INIT_RETRY_DELAY_MS = 250
const MONITORING_INIT_MAX_RETRIES = 20

function getEnvNumber(value: unknown, fallback: number) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function getDeploymentIdSafe() {
  try {
    return bridgeEnv.getDeploymentId()
  } catch {
    return ''
  }
}

function getFallbackSentryEnvironment() {
  return import.meta.env.DEV ? 'local' : import.meta.env.MODE
}

function hasAppsInTossBridgeRuntime() {
  if (typeof window === 'undefined') {
    return false
  }

  const runtimeWindow = window as Window & {
    ReactNativeWebView?: unknown
    __CONSTANT_HANDLER_MAP?: Record<string, unknown>
  }

  return runtimeWindow.ReactNativeWebView != null || runtimeWindow.__CONSTANT_HANDLER_MAP != null
}

function getSentryEnvironment() {
  const configuredEnvironment = getEnvString(import.meta.env.VITE_SENTRY_ENVIRONMENT)
  if (configuredEnvironment.length > 0) {
    return configuredEnvironment
  }

  try {
    const environment = getOperationalEnvironment()
    if (environment.length > 0) {
      return environment
    }
  } catch {
    // Fall through to local defaults when the bridge is unavailable.
  }

  return getFallbackSentryEnvironment()
}

function getSentryRelease() {
  const configuredRelease = getEnvString(import.meta.env.VITE_SENTRY_RELEASE)
  if (configuredRelease.length > 0) {
    return configuredRelease
  }

  const deploymentId = getDeploymentIdSafe()
  return deploymentId.length > 0 ? deploymentId : undefined
}

function clearMonitoringRetryTimer() {
  if (initializationRetryTimer === null) {
    return
  }

  window.clearTimeout(initializationRetryTimer)
  initializationRetryTimer = null
}

function scheduleMonitoringInitRetry() {
  if (typeof window === 'undefined') {
    return
  }

  if (initialized || initializationRetryTimer !== null) {
    return
  }

  initializationRetryTimer = window.setTimeout(() => {
    initializationRetryTimer = null
    initializationRetryCount += 1
    initMonitoring()
  }, MONITORING_INIT_RETRY_DELAY_MS)
}

function resolveSentryRuntimeConfig() {
  const environment = getSentryEnvironment()
  const release = getSentryRelease()

  if (release !== undefined) {
    return {
      environment,
      release,
    }
  }

  if (!hasAppsInTossBridgeRuntime() || initializationRetryCount >= MONITORING_INIT_MAX_RETRIES) {
    return {
      environment,
      release,
    }
  }

  return null
}

function createLocalErrorReference() {
  const random = Math.random().toString(36).slice(2, 8)
  return `local-${Date.now().toString(36)}-${random}`
}

function normalizeError(error: unknown) {
  if (error instanceof Error) {
    return error
  }

  if (typeof error === 'string') {
    return new Error(error)
  }

  return new Error('Unknown error')
}

export function initMonitoring() {
  if (initialized) {
    return
  }

  const dsn = getEnvString(import.meta.env.VITE_SENTRY_DSN)
  if (dsn.length === 0) {
    return
  }

  const runtimeConfig = resolveSentryRuntimeConfig()
  if (runtimeConfig === null) {
    scheduleMonitoringInitRetry()
    return
  }

  clearMonitoringRetryTimer()
  initialized = true

  Sentry.init({
    dsn,
    environment: runtimeConfig.environment,
    release: runtimeConfig.release,
    tracesSampleRate: getEnvNumber(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE, 0),
    sendDefaultPii: true,
  })

  sentryEnabled = true
  Sentry.setTag('app', 'apps-in-toss-boilerplate')

  const deploymentId = getDeploymentIdSafe()
  if (deploymentId.length > 0) {
    Sentry.setTag('deploymentId', deploymentId)
  }
}

export function captureAppError(error: unknown, context: ErrorContext) {
  const normalizedError = normalizeError(error)
  const fallbackReference = createLocalErrorReference()

  if (!sentryEnabled) {
    return fallbackReference
  }

  const eventId = Sentry.withScope((scope) => {
    scope.setTag('scope', context.scope)
    scope.setLevel('error')

    if (context.extra != null) {
      scope.setExtras(context.extra)
    }

    return Sentry.captureException(normalizedError)
  })

  return eventId.length > 0 ? eventId : fallbackReference
}
