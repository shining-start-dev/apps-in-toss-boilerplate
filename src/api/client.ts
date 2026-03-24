import { readAuthToken } from '../auth'
import { captureAppError } from '../monitoring'
import { AppError } from '../utils/appError'
import { toServerRequestUrl } from './config'

export class ApiClientError extends AppError {
  constructor(message: string, status: number, eventId?: string) {
    super(message, {
      name: 'ApiClientError',
      status,
      eventId,
    })
  }
}

async function parseErrorMessage(response: Response) {
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

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  auth?: boolean
}

export async function requestApi<T>(path: string, options: RequestOptions = {}) {
  const method = options.method ?? 'GET'
  const headers: Record<string, string> = {}

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  if (options.auth !== false) {
    const token = await readAuthToken()
    if (token === null) {
      throw new ApiClientError('인증 토큰이 없어요. 다시 로그인해 주세요.', 401)
    }

    headers.Authorization = `Bearer ${token}`
  }

  const requestUrl = toServerRequestUrl(path)
  let response: Response

  try {
    response = await fetch(requestUrl, {
      method,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    })
  } catch (error) {
    const eventId = captureAppError(error, {
      scope: 'api.request.network',
      extra: {
        path,
        requestUrl,
        method,
      },
    })

    throw new ApiClientError('네트워크 오류가 발생했어요. 다시 시도해 주세요.', 0, eventId)
  }

  if (!response.ok) {
    const message = await parseErrorMessage(response)
    const eventId = captureAppError(new Error(message), {
      scope: 'api.request.response',
      extra: {
        path,
        requestUrl,
        method,
        status: response.status,
      },
    })

    throw new ApiClientError(message, response.status, eventId)
  }

  if (response.status === 204) {
    return undefined as T
  }

  try {
    return (await response.json()) as T
  } catch (error) {
    const eventId = captureAppError(error, {
      scope: 'api.request.parse',
      extra: {
        path,
        requestUrl,
        method,
        status: response.status,
      },
    })

    throw new ApiClientError('응답을 처리하지 못했어요. 다시 시도해 주세요.', response.status, eventId)
  }
}
