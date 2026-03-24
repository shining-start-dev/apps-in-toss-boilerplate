type AppErrorOptions = {
  name?: string
  status?: number
  eventId?: string
  cause?: unknown
}

export class AppError extends Error {
  status?: number
  eventId?: string
  override cause?: unknown

  constructor(message: string, options: AppErrorOptions = {}) {
    super(message)
    this.name = options.name ?? 'AppError'
    this.status = options.status
    this.eventId = options.eventId
    this.cause = options.cause
  }
}

export function createAppError(message: string, options: AppErrorOptions = {}) {
  return new AppError(message, options)
}

export function getErrorEventId(error: unknown) {
  return error instanceof AppError && typeof error.eventId === 'string' ? error.eventId : undefined
}
