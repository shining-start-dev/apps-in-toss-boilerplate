import { Analytics } from '@apps-in-toss/web-framework'

type AnalyticsPrimitive = string | number | boolean | null

export type AnalyticsParams = Record<string, AnalyticsPrimitive>

type AnalyticsWithMethods = {
  init?: (options: unknown) => void | Promise<void>
  click?: (params: AnalyticsParams) => void | Promise<void>
  screen?: (params: AnalyticsParams) => void | Promise<void>
  impression?: (params: AnalyticsParams) => void | Promise<void>
}

const analyticsBridge = Analytics as unknown as AnalyticsWithMethods
let analyticsInitialized = false

function isPromiseLike(value: unknown): value is Promise<void> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'then' in value &&
    typeof (value as { then?: unknown }).then === 'function'
  )
}

function swallowAnalyticsFailure(result: unknown) {
  if (isPromiseLike(result)) {
    void result.catch(() => {
      // Analytics failure should never block product flows.
    })
  }
}

function runAnalytics(method: keyof AnalyticsWithMethods, params: AnalyticsParams = {}) {
  try {
    const analyticsMethod = analyticsBridge[method]
    if (analyticsMethod == null) {
      return
    }

    swallowAnalyticsFailure(analyticsMethod(params))
  } catch {
    // Analytics failure should never block product flows.
  }
}

export function initAnalytics() {
  if (analyticsInitialized) {
    return
  }

  analyticsInitialized = true

  try {
    swallowAnalyticsFailure(analyticsBridge.init?.({}))
  } catch {
    // Ignore analytics init failures.
  }
}

export function logAnalyticsClick(logName: string, params: AnalyticsParams = {}) {
  runAnalytics('click', {
    log_name: logName,
    ...params,
  })
}

export function logAnalyticsScreen(logName: string, params: AnalyticsParams = {}) {
  runAnalytics('screen', {
    log_name: logName,
    ...params,
  })
}

export function logAnalyticsImpression(logName: string, params: AnalyticsParams = {}) {
  runAnalytics('impression', {
    log_name: logName,
    ...params,
  })
}
