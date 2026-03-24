import { useNavigate } from 'react-router-dom'
import { Button, Paragraph } from '@toss/tds-mobile'
import { colors } from '@toss/tds-colors'
import { Page, Screen } from '../components/Layout'
import { InfoCard } from '../components/InfoCard'
import type { DebugRuntimeMode, ResolvedOperationalEnvironment } from '../debugRuntimeMode'

type IntroPageProps = {
  authTokenStatus: 'present' | 'empty'
  authErrorMessage: string | null
  debugRuntimeMode: DebugRuntimeMode
  resolvedRuntimeMode: 'live' | 'dev'
  resolvedOperationalEnvironment: ResolvedOperationalEnvironment
  isLoading: boolean
  isMutating: boolean
  isAppsInTossWebView: boolean
  onRunAppLogin: () => void
  onClearAuthToken: () => void
}

export function IntroPage({
  authTokenStatus,
  authErrorMessage,
  debugRuntimeMode,
  resolvedRuntimeMode,
  resolvedOperationalEnvironment,
  isLoading,
  isMutating,
  isAppsInTossWebView,
  onRunAppLogin,
  onClearAuthToken,
}: IntroPageProps) {
  const navigate = useNavigate()

  return (
    <Screen>
      <Page>
        <section className="boilerplate-hero">
          <div className="boilerplate-hero-grid" aria-hidden />
          <div className="boilerplate-pill-row">
            <span className="boilerplate-pill">Apps in Toss</span>
            <span className="boilerplate-pill">React + Vite</span>
            <span className="boilerplate-pill">Debug Ready</span>
          </div>
          <Paragraph typography="t2" color={colors.grey900} fontWeight="bold" style={{ margin: 0 }}>
            앱 인 토스 보일러플레이트
          </Paragraph>
          <Paragraph
            typography="t6"
            color={colors.grey700}
            style={{ margin: '8px 0 0', lineHeight: 1.55 }}
          >
            인증, API, 모니터링, 디버그 페이지가 기본 포함된 스타터입니다.
          </Paragraph>
        </section>

        <div className="boilerplate-stack">
          <InfoCard
            title="현재 상태"
            description="로컬 웹과 Toss WebView 양쪽에서 공통으로 확인할 수 있는 기본 상태입니다."
            statusLabel={authTokenStatus === 'present' ? '토큰 있음' : '토큰 없음'}
            statusTone={authTokenStatus === 'present' ? 'success' : 'neutral'}
          >
            <div className="boilerplate-grid">
              <div className="boilerplate-metric">
                <span className="boilerplate-metric-label">runtime</span>
                <span className="boilerplate-metric-value">{resolvedRuntimeMode}</span>
              </div>
              <div className="boilerplate-metric">
                <span className="boilerplate-metric-label">environment</span>
                <span className="boilerplate-metric-value">{resolvedOperationalEnvironment}</span>
              </div>
              <div className="boilerplate-metric">
                <span className="boilerplate-metric-label">debug mode</span>
                <span className="boilerplate-metric-value">{debugRuntimeMode}</span>
              </div>
              <div className="boilerplate-metric">
                <span className="boilerplate-metric-label">host</span>
                <span className="boilerplate-metric-value">
                  {isAppsInTossWebView ? 'Apps in Toss WebView' : 'Browser Preview'}
                </span>
              </div>
            </div>
          </InfoCard>

          <InfoCard title="시작 액션" description="바로 확장할 수 있게 기본 진입 버튼을 넣어 두었습니다.">
            <div className="boilerplate-actions">
              <Button color="primary" disabled={isLoading || isMutating} onClick={onRunAppLogin}>
                appLogin 실행
              </Button>
              <Button
                variant="weak"
                color="primary"
                disabled={isLoading || isMutating}
                onClick={onClearAuthToken}
              >
                토큰 초기화
              </Button>
            </div>
            <div className="boilerplate-actions" style={{ marginTop: 10 }}>
              <Button color="primary" variant="weak" onClick={() => navigate('/home')}>
                샘플 홈 보기
              </Button>
              <Button color="primary" variant="weak" onClick={() => navigate('/debug')}>
                디버그 도구
              </Button>
            </div>
          </InfoCard>

          {authErrorMessage ? (
            <div className="boilerplate-note">
              <strong style={{ display: 'block', marginBottom: 4 }}>최근 오류</strong>
              <span>{authErrorMessage}</span>
            </div>
          ) : null}
        </div>
      </Page>
    </Screen>
  )
}
