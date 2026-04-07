import { useNavigate } from 'react-router-dom'
import { Button, Paragraph } from '@toss/tds-mobile'
import { colors } from '@toss/tds-colors'
import { Page, Screen } from '../components/Layout'
import { InfoCard } from '../components/InfoCard'
import type { DebugRuntimeMode, ResolvedOperationalEnvironment } from '../debugRuntimeMode'
import { toServerRequestUrl } from '../api/config'

type HomePageProps = {
  authTokenStatus: 'present' | 'empty'
  authTokenPreview: string | null
  debugRuntimeMode: DebugRuntimeMode
  resolvedRuntimeMode: 'live' | 'dev'
  resolvedOperationalEnvironment: ResolvedOperationalEnvironment
  isAppsInTossWebView: boolean
  isLoading: boolean
  isMutating: boolean
  isDebugToolsEnabled: boolean
  onRefresh: () => void
  onRunAppLogin: () => void
  onClearAuthToken: () => void
}

export function HomePage({
  authTokenStatus,
  authTokenPreview,
  debugRuntimeMode,
  resolvedRuntimeMode,
  resolvedOperationalEnvironment,
  isAppsInTossWebView,
  isLoading,
  isMutating,
  isDebugToolsEnabled,
  onRefresh,
  onRunAppLogin,
  onClearAuthToken,
}: HomePageProps) {
  const navigate = useNavigate()

  return (
    <Screen>
      <Page>
        <section className="boilerplate-hero">
          <div className="boilerplate-hero-grid" aria-hidden />
          <div className="boilerplate-pill-row">
            <span className="boilerplate-pill">Starter Home</span>
            <span className="boilerplate-pill">{resolvedRuntimeMode}</span>
            <span className="boilerplate-pill">{resolvedOperationalEnvironment}</span>
          </div>
          <Paragraph typography="t3" color={colors.grey900} fontWeight="bold" style={{ margin: 0 }}>
            서비스 홈 샘플
          </Paragraph>
          <Paragraph
            typography="t6"
            color={colors.grey700}
            style={{ margin: '6px 0 0', lineHeight: 1.55 }}
          >
            이 화면을 실제 도메인 대시보드로 교체하면 됩니다.
          </Paragraph>
        </section>

        <div className="boilerplate-stack">
          <InfoCard
            title="인증 상태"
            description="토큰 저장 상태와 현재 미리보기 값을 보여줍니다."
            statusLabel={authTokenStatus === 'present' ? 'authorized' : 'guest'}
            statusTone={authTokenStatus === 'present' ? 'success' : 'neutral'}
          >
            <div className="boilerplate-grid">
              <div className="boilerplate-metric">
                <span className="boilerplate-metric-label">token</span>
                <span className="boilerplate-metric-value">{authTokenStatus}</span>
              </div>
              <div className="boilerplate-metric">
                <span className="boilerplate-metric-label">preview</span>
                <span className="boilerplate-metric-value">{authTokenPreview ?? '없음'}</span>
              </div>
            </div>
            <div className="boilerplate-actions" style={{ marginTop: 10 }}>
              <Button color="primary" disabled={isLoading || isMutating} onClick={onRunAppLogin}>
                로그인 갱신
              </Button>
              <Button
                variant="weak"
                color="primary"
                disabled={isLoading || isMutating}
                onClick={onClearAuthToken}
              >
                로그아웃
              </Button>
            </div>
          </InfoCard>

          <InfoCard title="런타임 정보" description="디버그 모드가 API와 인증 흐름에 어떻게 반영되는지 확인합니다.">
            <div className="boilerplate-grid">
              <div className="boilerplate-metric">
                <span className="boilerplate-metric-label">debug mode</span>
                <span className="boilerplate-metric-value">{debugRuntimeMode}</span>
              </div>
              <div className="boilerplate-metric">
                <span className="boilerplate-metric-label">resolved mode</span>
                <span className="boilerplate-metric-value">{resolvedRuntimeMode}</span>
              </div>
              <div className="boilerplate-metric">
                <span className="boilerplate-metric-label">environment</span>
                <span className="boilerplate-metric-value">{resolvedOperationalEnvironment}</span>
              </div>
              <div className="boilerplate-metric">
                <span className="boilerplate-metric-label">surface</span>
                <span className="boilerplate-metric-value">
                  {isAppsInTossWebView ? 'webview' : 'browser'}
                </span>
              </div>
            </div>
          </InfoCard>

          <InfoCard title="확장 포인트" description="백엔드와 화면을 채울 때 가장 먼저 바꾸는 지점들입니다.">
            <div className="boilerplate-route-list">
              <div className="boilerplate-route-item">
                <span>`src/api/endpoints.ts`</span>
                <span>{toServerRequestUrl('/api/example')}</span>
              </div>
              <div className="boilerplate-route-item">
                <span>`src/auth.ts`</span>
                <span>appLogin + JWT</span>
              </div>
              <div className="boilerplate-route-item">
                <span>`src/pages/DebugPage.tsx`</span>
                <span>운영 보조 도구</span>
              </div>
            </div>
            <div className="boilerplate-actions" style={{ marginTop: 10 }}>
              <Button color="primary" variant="weak" onClick={() => void onRefresh()}>
                상태 새로고침
              </Button>
              {isDebugToolsEnabled ? (
                <Button color="primary" variant="weak" onClick={() => navigate('/debug')}>
                  디버그로 이동
                </Button>
              ) : null}
            </div>
          </InfoCard>
        </div>
      </Page>
    </Screen>
  )
}
