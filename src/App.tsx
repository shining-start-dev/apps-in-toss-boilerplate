import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import {
  clearAuthToken,
  isAuthFlowCancelledError,
  readAuthToken,
  runAuthJoinFlow,
} from './auth'
import {
  type DebugRuntimeMode,
  getResolvedOperationalEnvironment,
  getResolvedRuntimeMode,
  readDebugRuntimeMode,
  writeDebugRuntimeMode,
} from './debugRuntimeMode'
import { ENABLE_DEBUG_TOOLS } from './debugTools'
import { IntroPage } from './pages/IntroPage'
import { HomePage } from './pages/HomePage'
import { DebugPage } from './pages/DebugPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { isAppsInTossWebView } from './runtime'
import { logAnalyticsScreen } from './analytics'
import { toErrorMessage } from './utils/error'
import './design.css'

type AuthTokenStatus = 'present' | 'empty'

function toTokenPreview(token: string | null) {
  if (token === null || token.length === 0) {
    return null
  }

  if (token.length <= 12) {
    return token
  }

  return `${token.slice(0, 6)}...${token.slice(-4)}`
}

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(true)
  const [isMutating, setIsMutating] = useState(false)
  const [authTokenStatus, setAuthTokenStatus] = useState<AuthTokenStatus>('empty')
  const [authTokenPreview, setAuthTokenPreview] = useState<string | null>(null)
  const [authErrorMessage, setAuthErrorMessage] = useState<string | null>(null)
  const [debugRuntimeMode, setDebugRuntimeMode] = useState<DebugRuntimeMode>('auto')

  async function refreshAuthState() {
    setIsLoading(true)
    try {
      const token = await readAuthToken()
      setAuthTokenStatus(token === null ? 'empty' : 'present')
      setAuthTokenPreview(toTokenPreview(token))
      setDebugRuntimeMode(readDebugRuntimeMode())
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void refreshAuthState()
  }, [])

  useEffect(() => {
    logAnalyticsScreen('boilerplate_screen_view', {
      path: location.pathname,
    })
  }, [location.pathname])

  async function handleRunAppLogin() {
    setIsMutating(true)
    setAuthErrorMessage(null)

    try {
      await runAuthJoinFlow()
      await refreshAuthState()
      navigate('/home')
    } catch (error) {
      if (isAuthFlowCancelledError(error)) {
        setAuthErrorMessage(error.message)
      } else {
        setAuthErrorMessage(toErrorMessage(error))
      }
    } finally {
      setIsMutating(false)
    }
  }

  async function handleClearAuthToken() {
    setIsMutating(true)
    setAuthErrorMessage(null)

    try {
      await clearAuthToken()
      await refreshAuthState()
    } catch (error) {
      setAuthErrorMessage(toErrorMessage(error))
    } finally {
      setIsMutating(false)
    }
  }

  async function handleSetDebugRuntimeMode(mode: DebugRuntimeMode) {
    setIsMutating(true)
    setAuthErrorMessage(null)

    try {
      writeDebugRuntimeMode(mode)
      await clearAuthToken()
      await refreshAuthState()
      navigate('/', { replace: true })
    } catch (error) {
      setAuthErrorMessage(toErrorMessage(error))
    } finally {
      setIsMutating(false)
    }
  }

  const resolvedRuntimeMode = getResolvedRuntimeMode()
  const resolvedOperationalEnvironment = getResolvedOperationalEnvironment()

  return (
    <Routes>
      <Route
        path="/"
        element={
          <IntroPage
            authTokenStatus={authTokenStatus}
            authErrorMessage={authErrorMessage}
            debugRuntimeMode={debugRuntimeMode}
            resolvedRuntimeMode={resolvedRuntimeMode}
            resolvedOperationalEnvironment={resolvedOperationalEnvironment}
            isLoading={isLoading}
            isMutating={isMutating}
            isAppsInTossWebView={isAppsInTossWebView()}
            onRunAppLogin={() => void handleRunAppLogin()}
            onClearAuthToken={() => void handleClearAuthToken()}
          />
        }
      />
      <Route
        path="/home"
        element={
          <HomePage
            authTokenStatus={authTokenStatus}
            authTokenPreview={authTokenPreview}
            debugRuntimeMode={debugRuntimeMode}
            resolvedRuntimeMode={resolvedRuntimeMode}
            resolvedOperationalEnvironment={resolvedOperationalEnvironment}
            isAppsInTossWebView={isAppsInTossWebView()}
            isLoading={isLoading}
            isMutating={isMutating}
            onRefresh={() => void refreshAuthState()}
            onRunAppLogin={() => void handleRunAppLogin()}
            onClearAuthToken={() => void handleClearAuthToken()}
          />
        }
      />
      {ENABLE_DEBUG_TOOLS ? (
        <Route
          path="/debug"
          element={
            <DebugPage
              authTokenStatus={authTokenStatus}
              authTokenPreview={authTokenPreview}
              authErrorMessage={authErrorMessage}
              debugRuntimeMode={debugRuntimeMode}
              resolvedRuntimeMode={resolvedRuntimeMode}
              resolvedOperationalEnvironment={resolvedOperationalEnvironment}
              isLoading={isLoading}
              isMutating={isMutating}
              onRefresh={() => void refreshAuthState()}
              onRunAppLogin={() => void handleRunAppLogin()}
              onClearAuthToken={() => void handleClearAuthToken()}
              onSetDebugRuntimeMode={(mode) => void handleSetDebugRuntimeMode(mode)}
            />
          }
        />
      ) : null}
      <Route path="/intro" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
