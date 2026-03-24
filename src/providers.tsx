import type { ComponentProps, PropsWithChildren } from 'react'
import { TDSMobileProvider } from '@toss/tds-mobile'
import { TDSMobileAITProvider } from '@toss/tds-mobile-ait'
import { canUseAppsInTossProvider } from './runtime'

export function Providers({ children }: PropsWithChildren) {
  if (canUseAppsInTossProvider()) {
    return <TDSMobileAITProvider>{children}</TDSMobileAITProvider>
  }

  const colorPreference =
    typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'

  const fallbackUserAgent: ComponentProps<typeof TDSMobileProvider>['userAgent'] = {
    fontA11y: undefined,
    fontScale: undefined,
    isAndroid: /android/i.test(navigator.userAgent),
    isIOS: /iphone|ipad|ipod/i.test(navigator.userAgent),
    colorPreference,
    safeAreaBottomTransparency: 'opaque',
  }

  return <TDSMobileProvider userAgent={fallbackUserAgent}>{children}</TDSMobileProvider>
}
