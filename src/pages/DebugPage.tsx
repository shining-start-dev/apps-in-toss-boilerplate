import { Button, Paragraph } from '@toss/tds-mobile'
import { colors } from '@toss/tds-colors'
import { Page, Screen } from '../components/Layout'
import { InfoCard } from '../components/InfoCard'
import type { DebugStorageEntry } from '../debugStorage'
import type { DebugRuntimeMode, ResolvedOperationalEnvironment } from '../debugRuntimeMode'

type DebugPageProps = {
  currentPathname: string
  authTokenStatus: 'present' | 'empty'
  authTokenPreview: string | null
  authErrorMessage: string | null
  runtimeContextLabel: string
  debugRuntimeMode: DebugRuntimeMode
  resolvedRuntimeMode: 'live' | 'dev'
  resolvedOperationalEnvironment: ResolvedOperationalEnvironment
  storageEntries: DebugStorageEntry[]
  storageErrorMessage: string | null
  isLoading: boolean
  isMutating: boolean
  onRefresh: () => void
  onRunAppLogin: () => void
  onClearAuthToken: () => void
  onSetDebugRuntimeMode: (mode: DebugRuntimeMode) => void
  onClearStorageKey: (key: string) => void
  onClearAllStorage: () => void
}

export function DebugPage({
  currentPathname,
  authTokenStatus,
  authTokenPreview,
  authErrorMessage,
  runtimeContextLabel,
  debugRuntimeMode,
  resolvedRuntimeMode,
  resolvedOperationalEnvironment,
  storageEntries,
  storageErrorMessage,
  isLoading,
  isMutating,
  onRefresh,
  onRunAppLogin,
  onClearAuthToken,
  onSetDebugRuntimeMode,
  onClearStorageKey,
  onClearAllStorage,
}: DebugPageProps) {
  const isBusy = isLoading || isMutating

  return (
    <Screen>
      <Page>
        <section className="boilerplate-hero">
          <div className="boilerplate-hero-grid" aria-hidden />
          <div className="boilerplate-pill-row">
            <span className="boilerplate-pill">Debug Tools</span>
            <span className="boilerplate-pill">{isBusy ? '반영 중' : '준비됨'}</span>
          </div>
          <Paragraph typography="t3" color={colors.grey900} fontWeight="bold" style={{ margin: 0 }}>
            런타임 디버그 도구
          </Paragraph>
          <Paragraph
            typography="t6"
            color={colors.grey700}
            style={{ margin: '6px 0 0', lineHeight: 1.55 }}
          >
            환경 전환, 인증 상태, 운영 중 확인 포인트를 한 곳에 모았습니다.
          </Paragraph>
        </section>

        <div className="boilerplate-stack">
          <InfoCard
            title="런타임 모드"
            description="모드를 바꾸면 토큰을 정리하고 초기 화면으로 이동합니다."
            statusLabel={resolvedRuntimeMode}
            statusTone={resolvedRuntimeMode === 'live' ? 'success' : 'warning'}
          >
            <div className="boilerplate-grid">
              <div className="boilerplate-metric">
                <span className="boilerplate-metric-label">설정값</span>
                <span className="boilerplate-metric-value">{debugRuntimeMode}</span>
              </div>
              <div className="boilerplate-metric">
                <span className="boilerplate-metric-label">적용 모드</span>
                <span className="boilerplate-metric-value">{resolvedRuntimeMode}</span>
              </div>
              <div className="boilerplate-metric">
                <span className="boilerplate-metric-label">environment</span>
                <span className="boilerplate-metric-value">{resolvedOperationalEnvironment}</span>
              </div>
            </div>
            <div className="boilerplate-actions" style={{ marginTop: 10 }}>
              <Button
                color="primary"
                variant={debugRuntimeMode === 'auto' ? 'fill' : 'weak'}
                disabled={isBusy}
                onClick={() => onSetDebugRuntimeMode('auto')}
              >
                자동
              </Button>
              <Button
                color="primary"
                variant={debugRuntimeMode === 'live' ? 'fill' : 'weak'}
                disabled={isBusy}
                onClick={() => onSetDebugRuntimeMode('live')}
              >
                라이브
              </Button>
              <Button
                color="primary"
                variant={debugRuntimeMode === 'dev' ? 'fill' : 'weak'}
                disabled={isBusy}
                onClick={() => onSetDebugRuntimeMode('dev')}
              >
                개발
              </Button>
            </div>
          </InfoCard>

          <InfoCard
            title="인증"
            description="토큰 상태를 확인하고 appLogin을 다시 수행할 수 있습니다."
            statusLabel={authTokenStatus}
            statusTone={authTokenStatus === 'present' ? 'success' : 'neutral'}
          >
            <div className="boilerplate-grid">
              <div className="boilerplate-metric">
                <span className="boilerplate-metric-label">저장 상태</span>
                <span className="boilerplate-metric-value">{authTokenStatus}</span>
              </div>
              <div className="boilerplate-metric">
                <span className="boilerplate-metric-label">토큰 미리보기</span>
                <span className="boilerplate-metric-value">{authTokenPreview ?? '없음'}</span>
              </div>
            </div>
            <div className="boilerplate-actions" style={{ marginTop: 10 }}>
              <Button color="primary" disabled={isBusy} onClick={onRunAppLogin}>
                appLogin
              </Button>
              <Button variant="weak" color="primary" disabled={isBusy} onClick={onClearAuthToken}>
                토큰 삭제
              </Button>
            </div>
          </InfoCard>

          <InfoCard
            title="런타임 컨텍스트"
            description="현재 경로와 WebView 컨텍스트를 한 번에 확인합니다."
            statusLabel={resolvedOperationalEnvironment}
            statusTone={resolvedRuntimeMode === 'live' ? 'success' : 'warning'}
          >
            <div className="boilerplate-grid">
              <div className="boilerplate-metric">
                <span className="boilerplate-metric-label">environment</span>
                <span className="boilerplate-metric-value">{resolvedOperationalEnvironment}</span>
              </div>
              <div className="boilerplate-metric">
                <span className="boilerplate-metric-label">current path</span>
                <span className="boilerplate-metric-value">{currentPathname}</span>
              </div>
              <div className="boilerplate-metric" style={{ gridColumn: '1 / -1' }}>
                <span className="boilerplate-metric-label">runtime context</span>
                <span className="boilerplate-metric-value">{runtimeContextLabel}</span>
              </div>
            </div>
          </InfoCard>

          <InfoCard title="운영용 체크리스트" description="초기 프로젝트에서 자주 확인하는 항목입니다.">
            <div className="boilerplate-route-list">
              <div className="boilerplate-route-item">
                <span>Sentry DSN</span>
                <span>{import.meta.env.VITE_SENTRY_DSN ? 'configured' : 'empty'}</span>
              </div>
              <div className="boilerplate-route-item">
                <span>API base URL</span>
                <span>{import.meta.env.VITE_AIP_SERVER_BASE_URL || 'relative path'}</span>
              </div>
              <div className="boilerplate-route-item">
                <span>Debug tools</span>
                <span>{import.meta.env.VITE_ENABLE_DEBUG_TOOLS || 'DEV default'}</span>
              </div>
            </div>
            <div className="boilerplate-actions" style={{ marginTop: 10 }}>
              <Button color="primary" variant="weak" disabled={isBusy} onClick={() => void onRefresh()}>
                상태 새로고침
              </Button>
            </div>
          </InfoCard>

          <InfoCard
            title="스토리지"
            description="브리지 Storage와 localStorage에 남아 있는 핵심 키를 비교합니다."
            statusLabel={storageEntries.length > 0 ? `${storageEntries.length} keys` : 'empty'}
            statusTone="neutral"
          >
            <div className="boilerplate-route-list">
              {storageEntries.length === 0 ? (
                <div className="boilerplate-route-item">
                  <span>표시할 저장 항목이 없어요.</span>
                  <span>-</span>
                </div>
              ) : (
                storageEntries.map((entry) => (
                  <div className="boilerplate-storage-card" key={entry.key}>
                    <div className="boilerplate-storage-head">
                      <span className="boilerplate-storage-key">{entry.key}</span>
                      <Button
                        color="primary"
                        variant="weak"
                        disabled={isBusy}
                        onClick={() => onClearStorageKey(entry.key)}
                      >
                        삭제
                      </Button>
                    </div>
                    <div className="boilerplate-grid">
                      <div className="boilerplate-metric">
                        <span className="boilerplate-metric-label">local</span>
                        <span className="boilerplate-metric-value">
                          {entry.localValue ?? 'null'}
                        </span>
                      </div>
                      <div className="boilerplate-metric">
                        <span className="boilerplate-metric-label">bridge</span>
                        <span className="boilerplate-metric-value">
                          {entry.bridgeValue ?? 'null'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="boilerplate-actions" style={{ marginTop: 10 }}>
              <Button color="primary" variant="weak" disabled={isBusy} onClick={onClearAllStorage}>
                전체 초기화
              </Button>
              <Button color="primary" variant="weak" disabled={isBusy} onClick={() => void onRefresh()}>
                다시 읽기
              </Button>
            </div>
          </InfoCard>

          {authErrorMessage ? (
            <div className="boilerplate-note">
              <strong style={{ display: 'block', marginBottom: 4 }}>최근 인증 오류</strong>
              <span>{authErrorMessage}</span>
            </div>
          ) : null}

          {storageErrorMessage ? (
            <div className="boilerplate-note">
              <strong style={{ display: 'block', marginBottom: 4 }}>최근 스토리지 오류</strong>
              <span>{storageErrorMessage}</span>
            </div>
          ) : null}
        </div>
      </Page>
    </Screen>
  )
}
