import { describe, expect, it } from 'vitest'
import { normalizeLoginReferrer, toAppLoginPayload } from './auth-payload'

describe('normalizeLoginReferrer', () => {
  it('returns normalized supported values', () => {
    expect(normalizeLoginReferrer('default')).toBe('DEFAULT')
    expect(normalizeLoginReferrer('SANDBOX')).toBe('SANDBOX')
  })

  it('returns null for unsupported values', () => {
    expect(normalizeLoginReferrer('unknown')).toBeNull()
    expect(normalizeLoginReferrer(undefined)).toBeNull()
  })
})

describe('toAppLoginPayload', () => {
  it('reads authorizationCode and referrer from the app login result', () => {
    expect(
      toAppLoginPayload(
        {
          authorizationCode: 'auth-code',
          referrer: 'SANDBOX',
        },
        'DEFAULT',
      ),
    ).toEqual({
      authorizationCode: 'auth-code',
      referrer: 'SANDBOX',
    })
  })

  it('falls back to the provided referrer', () => {
    expect(
      toAppLoginPayload(
        {
          code: 'auth-code',
        },
        'DEFAULT',
      ),
    ).toEqual({
      authorizationCode: 'auth-code',
      referrer: 'DEFAULT',
    })
  })
})
