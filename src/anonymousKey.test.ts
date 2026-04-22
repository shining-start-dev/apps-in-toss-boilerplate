import { describe, expect, it, vi } from 'vitest'

const getAnonymousKeyMock = vi.fn()
const captureAppErrorMock = vi.fn()
const isAppsInTossWebViewMock = vi.fn(() => true)

vi.mock('@apps-in-toss/web-framework', () => ({
  getAnonymousKey: getAnonymousKeyMock,
}))

vi.mock('./monitoring', () => ({
  captureAppError: captureAppErrorMock,
}))

vi.mock('./runtime', () => ({
  isAppsInTossWebView: isAppsInTossWebViewMock,
}))

const { readAnonymousKeyStatus, toAnonymousKeyPreview } = await import('./anonymousKey')

describe('anonymousKey', () => {
  it('returns browser status outside Apps in Toss WebView', async () => {
    isAppsInTossWebViewMock.mockReturnValue(false)

    await expect(readAnonymousKeyStatus()).resolves.toEqual({
      status: 'browser',
    })
  })

  it('returns unsupported when the bridge does not support the API yet', async () => {
    isAppsInTossWebViewMock.mockReturnValue(true)
    getAnonymousKeyMock.mockResolvedValue(undefined)

    await expect(readAnonymousKeyStatus()).resolves.toEqual({
      status: 'unsupported',
    })
  })

  it('returns the anonymous hash when the bridge succeeds', async () => {
    isAppsInTossWebViewMock.mockReturnValue(true)
    getAnonymousKeyMock.mockResolvedValue({
      type: 'HASH',
      hash: 'abcdef1234567890',
    })

    await expect(readAnonymousKeyStatus()).resolves.toEqual({
      status: 'available',
      hash: 'abcdef1234567890',
    })
    expect(toAnonymousKeyPreview('abcdef1234567890')).toBe('abcdef...7890')
  })

  it('maps bridge errors to an error state and captures them', async () => {
    isAppsInTossWebViewMock.mockReturnValue(true)
    getAnonymousKeyMock.mockResolvedValue('ERROR')

    await expect(readAnonymousKeyStatus()).resolves.toEqual({
      status: 'error',
      message: '익명 사용자 키 조회 중 오류가 발생했어요.',
    })
    expect(captureAppErrorMock).toHaveBeenCalled()
  })
})
