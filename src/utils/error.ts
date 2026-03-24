export function toErrorMessage(
  error: unknown,
  fallback = '요청 처리 중 문제가 발생했어요. 다시 시도해 주세요.',
) {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message
  }

  if (typeof error === 'string' && error.trim().length > 0) {
    return error
  }

  return fallback
}
