import {
  Storage,
  appLogin,
  env as bridgeEnv,
  getOperationalEnvironment,
} from '@apps-in-toss/web-framework'
import { toServerRequestUrl } from './api/config'
import { APP_NAME, AUTH_LOGIN_PATH } from './api/endpoints'
import type { ApiLoginResponse } from './api/types'
import { toAppLoginPayload, type LoginReferrer } from './auth-payload'
import { captureAppError } from './monitoring'
import { createAppError, getErrorEventId } from './utils/appError'
import { getEnvString } from './utils/env'

const AUTH_TOKEN_STORAGE_KEY = 'ait_boilerplate_auth_token'
const AUTH_FLOW_CANCELLED_ERROR_NAME = 'AuthFlowCancelledError'
const AUTH_FLOW_CANCELLED_MARKER = '__aitBoilerplateAuthFlowCancelled'

export class AuthFlowCancelledError extends Error {
  readonly [AUTH_FLOW_CANCELLED_MARKER] = true

  constructor(message = '로그인을 취소했어요.') {
    super(message)
    this.name = AUTH_FLOW_CANCELLED_ERROR_NAME
  }
}

function getAuthLoginEndpoint() {
  return toServerRequestUrl(AUTH_LOGIN_PATH)
}

function isAppsInTossWebView() {
  if (typeof window === 'undefined') {
    return false
  }

  const constantHandlerMap = (window as Window & {
    __CONSTANT_HANDLER_MAP?: Record<string, unknown>
  }).__CONSTANT_HANDLER_MAP

  return Boolean(constantHandlerMap?.deploymentId)
}

function isSandboxDeployment() {
  try {
    return getOperationalEnvironment() === 'sandbox'
  } catch {
    return false
  }
}

function getDeploymentIdSafe() {
  try {
    return bridgeEnv.getDeploymentId()
  } catch {
    return ''
  }
}

function getFallbackLoginReferrer(): LoginReferrer {
  return isSandboxDeployment() ? 'SANDBOX' : 'DEFAULT'
}

function getErrorSignature(error: unknown) {
  if (!(error instanceof Error)) {
    return {
      code: '',
      message: '',
    }
  }

  const code =
    typeof (error as Error & { code?: unknown }).code === 'string'
      ? ((error as Error & { code?: string }).code ?? '').toUpperCase()
      : ''

  return {
    code,
    message: error.message,
  }
}

function isUserCancelledAppLoginError(code: string, message: string) {
  const normalizedCode = code.toUpperCase()
  const lowerMessage = message.toLowerCase()

  return (
    normalizedCode === 'USER_CANCELED' ||
    normalizedCode === 'USER_CANCELLED' ||
    normalizedCode === 'USER_CANCEL' ||
    normalizedCode === 'CANCELED' ||
    normalizedCode === 'CANCELLED' ||
    normalizedCode === 'CANCEL' ||
    lowerMessage.includes('user canceled') ||
    lowerMessage.includes('user cancelled') ||
    lowerMessage.includes('cancel') ||
    message.includes('취소')
  )
}

export function isAuthFlowCancelledError(error: unknown): error is AuthFlowCancelledError {
  return (
    error instanceof AuthFlowCancelledError ||
    (typeof error === 'object' &&
      error !== null &&
      ((AUTH_FLOW_CANCELLED_MARKER in error &&
        (error as Record<string, unknown>)[AUTH_FLOW_CANCELLED_MARKER] === true) ||
        ('name' in error &&
          (error as Record<string, unknown>).name === AUTH_FLOW_CANCELLED_ERROR_NAME)))
  )
}

function isRequestSerializerError(code: string, message: string) {
  return (
    code === 'REQUEST_SERIALIZED_ERROR' ||
    code === 'REQUEST_SERIALIZER_ERROR' ||
    message.includes('RequestSerializedError') ||
    message.includes('RequestSerializerError')
  )
}

function withRawErrorMessage(base: string, rawMessage: string) {
  const trimmed = rawMessage.trim()
  if (trimmed.length === 0) {
    return base
  }

  return `${base} (원문: ${trimmed})`
}

function getRuntimeContextLabel() {
  const deploymentId = getDeploymentIdSafe() || 'unknown'
  const host = typeof window === 'undefined' ? 'server' : window.location.host
  return `deploymentId=${deploymentId}, host=${host}`
}

async function readStorageToken() {
  try {
    return await Storage.getItem(AUTH_TOKEN_STORAGE_KEY)
  } catch (error) {
    captureAppError(error, {
      scope: 'auth.token_storage.read_bridge',
      extra: {
        storageKey: AUTH_TOKEN_STORAGE_KEY,
      },
    })
    return null
  }
}

async function writeStorageToken(token: string) {
  let lastEventId: string | undefined

  try {
    await Storage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
    return
  } catch (error) {
    lastEventId = captureAppError(error, {
      scope: 'auth.token_storage.write_bridge',
      extra: {
        storageKey: AUTH_TOKEN_STORAGE_KEY,
      },
    })
  }

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
      return
    } catch (error) {
      lastEventId = captureAppError(error, {
        scope: 'auth.token_storage.write_local',
        extra: {
          storageKey: AUTH_TOKEN_STORAGE_KEY,
        },
      })
    }
  }

  throw createAppError('인증 정보를 저장하지 못했어요. 다시 시도해 주세요.', {
    name: 'AuthStorageError',
    eventId: lastEventId,
  })
}

export async function readAuthToken() {
  const storageToken = await readStorageToken()
  if (typeof storageToken === 'string' && storageToken.length > 0) {
    return storageToken
  }

  if (typeof window === 'undefined') {
    return null
  }

  try {
    const localToken = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
    if (typeof localToken === 'string' && localToken.length > 0) {
      return localToken
    }
  } catch (error) {
    captureAppError(error, {
      scope: 'auth.token_storage.read_local',
      extra: {
        storageKey: AUTH_TOKEN_STORAGE_KEY,
      },
    })
  }

  return null
}

export async function clearAuthToken() {
  let localRemovalSucceeded = typeof window === 'undefined'

  try {
    await Storage.removeItem(AUTH_TOKEN_STORAGE_KEY)
  } catch (error) {
    captureAppError(error, {
      scope: 'auth.token_storage.remove_bridge',
      extra: {
        storageKey: AUTH_TOKEN_STORAGE_KEY,
      },
    })
  }

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
      localRemovalSucceeded = true
    } catch (error) {
      captureAppError(error, {
        scope: 'auth.token_storage.remove_local',
        extra: {
          storageKey: AUTH_TOKEN_STORAGE_KEY,
        },
      })
    }
  }

  if (!localRemovalSucceeded) {
    throw createAppError('인증 정보를 정리하지 못했어요. 다시 시도해 주세요.', {
      name: 'AuthStorageError',
    })
  }
}

async function getErrorMessage(response: Response) {
  try {
    const text = await response.text()
    if (text.length === 0) {
      return `요청 실패 (${response.status})`
    }

    const parsed = JSON.parse(text) as {
      message?: unknown
      error?: unknown
      reason?: unknown
    }

    if (typeof parsed.message === 'string' && parsed.message.length > 0) {
      return parsed.message
    }

    if (typeof parsed.error === 'string' && parsed.error.length > 0) {
      return parsed.error
    }

    if (typeof parsed.reason === 'string' && parsed.reason.length > 0) {
      return parsed.reason
    }

    return text
  } catch {
    return `요청 실패 (${response.status})`
  }
}

async function loginWithAuthorizationCode(authorizationCode: string, referrer: LoginReferrer) {
  const authLoginEndpoint = getAuthLoginEndpoint()
  const requestBody = {
    authorizationCode,
    appName: APP_NAME,
    referrer,
  }

  let response: Response

  try {
    response = await fetch(authLoginEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })
  } catch (error) {
    const eventId = captureAppError(error, {
      scope: 'auth.login.request.network',
      extra: {
        endpoint: authLoginEndpoint,
        referrer,
      },
    })

    throw createAppError('로그인 요청 중 네트워크 오류가 발생했어요. 다시 시도해 주세요.', {
      name: 'AuthLoginRequestError',
      eventId,
      cause: error,
    })
  }

  if (!response.ok) {
    const message = await getErrorMessage(response)
    const eventId = captureAppError(new Error(message), {
      scope: 'auth.login.request.response',
      extra: {
        endpoint: authLoginEndpoint,
        referrer,
        status: response.status,
      },
    })

    throw createAppError(message, {
      name: 'AuthLoginRequestError',
      status: response.status,
      eventId,
    })
  }

  let payload: ApiLoginResponse
  try {
    payload = (await response.json()) as ApiLoginResponse
  } catch (error) {
    const eventId = captureAppError(error, {
      scope: 'auth.login.request.parse',
      extra: {
        endpoint: authLoginEndpoint,
        referrer,
        status: response.status,
      },
    })

    throw createAppError('로그인 응답을 처리하지 못했어요. 다시 시도해 주세요.', {
      name: 'AuthLoginRequestError',
      status: response.status,
      eventId,
      cause: error,
    })
  }

  if (typeof payload.token !== 'string' || payload.token.length === 0) {
    const eventId = captureAppError(new Error('Missing auth token in login response'), {
      scope: 'auth.login.request.invalid_payload',
      extra: {
        endpoint: authLoginEndpoint,
        referrer,
        status: response.status,
      },
    })

    throw createAppError('인증 토큰을 받지 못했어요.', {
      name: 'AuthLoginRequestError',
      status: response.status,
      eventId,
    })
  }

  await writeStorageToken(payload.token)
}

function mapAppLoginError(error: unknown): Error {
  if (error instanceof Error) {
    const { code, message } = getErrorSignature(error)

    if (isUserCancelledAppLoginError(code, message)) {
      return new AuthFlowCancelledError()
    }

    if (isRequestSerializerError(code, message)) {
      if (isSandboxDeployment()) {
        return new Error(
          withRawErrorMessage(
            `샌드박스 로그인 세션이 유효하지 않아요. 샌드박스 앱 개발자 로그인을 다시 한 뒤 재시도해 주세요. (${getRuntimeContextLabel()})`,
            message,
          ),
        )
      }

      return new Error(
        withRawErrorMessage(
          `토스 로그인 요청 처리 중 네트워크 직렬화 오류가 발생했어요. 잠시 후 다시 시도해 주세요. (${getRuntimeContextLabel()})`,
          message,
        ),
      )
    }

    if (code === 'INVALID_REQUEST' || message.includes('요청이 올바르지 않습니다')) {
      if (isSandboxDeployment()) {
        return new Error(
          '샌드박스 로그인 요청이 거절됐어요. 샌드박스 앱에서 개발자 로그인 상태를 확인한 뒤 다시 시도해 주세요.',
        )
      }

      return new Error('로그인 요청이 거절됐어요. 토스 앱에서 다시 시도해 주세요.')
    }

    return error
  }

  return new Error('로그인 중 알 수 없는 오류가 발생했어요.')
}

export async function runAuthJoinFlow() {
  if (!isAppsInTossWebView()) {
    throw new Error('브라우저 환경에서는 appLogin을 사용할 수 없어요. Toss WebView에서 실행해 주세요.')
  }

  const forceAppLogin = getEnvString(import.meta.env.VITE_AIP_FORCE_APP_LOGIN).toLowerCase() === 'true'
  if (forceAppLogin) {
    await clearAuthToken()
  }

  try {
    const currentToken = await readAuthToken()
    if (currentToken !== null && !forceAppLogin) {
      return
    }

    const appLoginResult = await appLogin()
    const { authorizationCode, referrer } = toAppLoginPayload(
      appLoginResult,
      getFallbackLoginReferrer(),
    )

    await loginWithAuthorizationCode(authorizationCode, referrer)
  } catch (error) {
    const mappedError = mapAppLoginError(error)

    if (!isAuthFlowCancelledError(mappedError) && getErrorEventId(mappedError) === undefined) {
      const eventId = captureAppError(mappedError, {
        scope: 'auth.runAuthJoinFlow',
        extra: {
          deploymentId: getDeploymentIdSafe() || null,
          runtimeContext: getRuntimeContextLabel(),
        },
      })

      ;(mappedError as Error & { eventId?: string }).eventId = eventId
    }

    throw mappedError
  }
}
