import { getAnonymousKey } from '@apps-in-toss/web-framework'
import { captureAppError } from './monitoring'
import { isAppsInTossWebView } from './runtime'

export type AnonymousKeyReadResult =
  | {
      status: 'available'
      hash: string
    }
  | {
      status: 'browser'
    }
  | {
      status: 'unsupported'
    }
  | {
      status: 'error'
      message: string
    }

export async function readAnonymousKeyStatus(): Promise<AnonymousKeyReadResult> {
  if (!isAppsInTossWebView()) {
    return {
      status: 'browser',
    }
  }

  try {
    const result = await getAnonymousKey()

    if (result === undefined) {
      return {
        status: 'unsupported',
      }
    }

    if (typeof result === 'string') {
      captureAppError(new Error(`getAnonymousKey returned ${result}`), {
        scope: 'anonymous_key.read.response',
        extra: {
          result,
        },
      })

      return {
        status: 'error',
        message: '익명 사용자 키 조회 중 오류가 발생했어요.',
      }
    }

    if (result.type === 'HASH' && typeof result.hash === 'string' && result.hash.length > 0) {
      return {
        status: 'available',
        hash: result.hash,
      }
    }

    captureAppError(new Error('Unexpected getAnonymousKey response'), {
      scope: 'anonymous_key.read.invalid_payload',
      extra: {
        resultType: typeof result,
      },
    })

    return {
      status: 'error',
      message: '익명 사용자 키 응답을 해석하지 못했어요.',
    }
  } catch (error) {
    captureAppError(error, {
      scope: 'anonymous_key.read.exception',
    })

    return {
      status: 'error',
      message: '익명 사용자 키를 가져오지 못했어요.',
    }
  }
}

export function toAnonymousKeyPreview(hash: string) {
  if (hash.length <= 12) {
    return hash
  }

  return `${hash.slice(0, 6)}...${hash.slice(-4)}`
}
