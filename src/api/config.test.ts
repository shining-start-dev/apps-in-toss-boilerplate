import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../debugRuntimeMode', () => ({
  getResolvedOperationalEnvironment: vi.fn(() => 'local'),
  getResolvedRuntimeMode: vi.fn(() => 'dev'),
  readDebugRuntimeMode: vi.fn(() => 'auto'),
}))

const { normalizeBaseUrl, toServerRequestUrl } = await import('./config')

describe('api/config', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
  })

  it('normalizes trailing slash from base urls', () => {
    expect(normalizeBaseUrl('https://example.com/')).toBe('https://example.com')
  })

  it('keeps relative paths when no base url is configured', () => {
    expect(toServerRequestUrl('/api/health')).toBe('/api/health')
  })

  it('uses the configured base url when provided', () => {
    vi.stubEnv('VITE_AIP_SERVER_BASE_URL', 'https://example.com')
    expect(toServerRequestUrl('/api/health')).toBe('https://example.com/api/health')
  })
})
