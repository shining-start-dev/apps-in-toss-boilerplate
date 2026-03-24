import { getOperationalEnvironment } from '@apps-in-toss/web-framework'

export function isAppsInTossWebView() {
  if (typeof window === 'undefined') {
    return false
  }

  const constantHandlerMap = (window as Window & {
    __CONSTANT_HANDLER_MAP?: Record<string, unknown>
  }).__CONSTANT_HANDLER_MAP

  return Boolean(constantHandlerMap?.deploymentId)
}

function getConstantHandlerMap() {
  return (window as Window & {
    __CONSTANT_HANDLER_MAP?: Record<string, unknown>
  }).__CONSTANT_HANDLER_MAP
}

const REQUIRED_AIT_CONSTANTS = [
  'deploymentId',
  'brandDisplayName',
  'brandIcon',
  'brandPrimaryColor',
] as const

function hasNonEmptyStringValue(
  source: Record<string, unknown>,
  key: (typeof REQUIRED_AIT_CONSTANTS)[number],
) {
  const value = source[key]
  return typeof value === 'string' && value.trim().length > 0
}

export function canUseAppsInTossProvider() {
  if (typeof window === 'undefined') {
    return false
  }

  const constantHandlerMap = getConstantHandlerMap()
  if (constantHandlerMap == null) {
    return false
  }

  try {
    if (getOperationalEnvironment() === 'sandbox') {
      return false
    }
  } catch {
    return false
  }

  return REQUIRED_AIT_CONSTANTS.every((key) => hasNonEmptyStringValue(constantHandlerMap, key))
}
