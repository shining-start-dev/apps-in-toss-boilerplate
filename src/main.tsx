import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import * as Sentry from '@sentry/react'
import './index.css'
import App from './App'
import { Providers } from './providers'
import { initMonitoring } from './monitoring'
import { AppErrorScreen } from './components/AppErrorScreen'
import { initAnalytics } from './analytics'

initMonitoring()
initAnalytics()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Sentry.ErrorBoundary
        fallback={(errorData) => (
          <AppErrorScreen
            error={errorData.error}
            eventId={errorData.eventId}
            resetError={() => errorData.resetError()}
          />
        )}
      >
        <Providers>
          <App />
        </Providers>
      </Sentry.ErrorBoundary>
    </BrowserRouter>
  </StrictMode>,
)
