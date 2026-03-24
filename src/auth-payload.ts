export type LoginReferrer = 'DEFAULT' | 'SANDBOX'

function getNonEmptyString(value: unknown) {
  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export function normalizeLoginReferrer(value: unknown): LoginReferrer | null {
  const normalized = getNonEmptyString(value)?.toUpperCase()
  if (normalized === 'DEFAULT' || normalized === 'SANDBOX') {
    return normalized
  }

  return null
}

export function toAppLoginPayload(
  result: unknown,
  fallbackReferrer: LoginReferrer,
): { authorizationCode: string; referrer: LoginReferrer } {
  const resultRecord =
    typeof result === 'object' && result !== null ? (result as Record<string, unknown>) : {}

  const authorizationCode =
    getNonEmptyString(resultRecord.authorizationCode) ?? getNonEmptyString(resultRecord.code) ?? ''

  if (authorizationCode.length === 0) {
    throw new Error('인증 코드를 받지 못했어요.')
  }

  const referrer =
    normalizeLoginReferrer(resultRecord.referrer ?? resultRecord.referer) ?? fallbackReferrer

  return {
    authorizationCode,
    referrer,
  }
}
