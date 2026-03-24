import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button, Paragraph } from '@toss/tds-mobile'
import { colors } from '@toss/tds-colors'
import { isAuthFlowCancelledError } from '../auth'
import { toErrorMessage } from '../utils/error'

type AppErrorScreenProps = {
  error: unknown
  eventId: string
  resetError: () => void
  pathnameOverride?: string
}

export function AppErrorScreen({
  error,
  eventId,
  resetError,
  pathnameOverride,
}: AppErrorScreenProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const pathname = pathnameOverride ?? location.pathname
  const isDev = import.meta.env.DEV
  const message = isDev ? toErrorMessage(error) : null
  const isAuthCancelled = isAuthFlowCancelledError(error)

  useEffect(() => {
    if (!isAuthCancelled) {
      return
    }

    resetError()
    navigate('/', { replace: true })
  }, [isAuthCancelled, navigate, resetError])

  if (isAuthCancelled) {
    return null
  }

  return (
    <main className="boilerplate-error-screen">
      <section className="boilerplate-error-card">
        <Paragraph typography="t3" color={colors.grey900} fontWeight="bold" style={{ margin: 0 }}>
          일시적인 오류가 발생했어요
        </Paragraph>
        <Paragraph
          typography="t6"
          color={colors.grey700}
          style={{ margin: '8px 0 0', lineHeight: 1.5 }}
        >
          잠시 후 다시 시도해 주세요.
        </Paragraph>
        <Paragraph
          typography="t7"
          color={colors.grey600}
          style={{ margin: '16px 0 0', lineHeight: 1.5 }}
        >
          eventId: {eventId || 'local-only'} / path: {pathname}
        </Paragraph>

        {message !== null ? (
          <div className="boilerplate-note" style={{ marginTop: 16 }}>
            <strong style={{ display: 'block', marginBottom: 6 }}>개발용 오류 메시지</strong>
            <span>{message}</span>
          </div>
        ) : null}

        <div className="boilerplate-actions" style={{ marginTop: 18 }}>
          <Button
            color="primary"
            onClick={() => {
              resetError()
              navigate('/', { replace: true })
            }}
          >
            홈으로
          </Button>
          <Button
            variant="weak"
            color="primary"
            onClick={() => {
              resetError()
              window.location.reload()
            }}
          >
            새로고침
          </Button>
        </div>
      </section>
    </main>
  )
}
