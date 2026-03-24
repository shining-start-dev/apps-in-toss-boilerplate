import type { HTMLAttributes, PropsWithChildren } from 'react'

type ScreenProps = PropsWithChildren<Omit<HTMLAttributes<HTMLElement>, 'className'>>
type PageProps = PropsWithChildren<Omit<HTMLAttributes<HTMLElement>, 'className'>>

export const PAGE_TOP_PADDING = 16

export function Screen({ children, style, ...rest }: ScreenProps) {
  return (
    <section
      className="boilerplate-shell"
      style={{
        width: '100%',
        maxWidth: 430,
        minHeight: '100dvh',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
      {...rest}
    >
      {children}
    </section>
  )
}

export function Page({ children, style, ...rest }: PageProps) {
  return (
    <section
      style={{
        width: '100%',
        flex: 1,
        padding: `${PAGE_TOP_PADDING}px 20px max(48px, calc(env(safe-area-inset-bottom) + 24px))`,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        ...style,
      }}
      {...rest}
    >
      {children}
    </section>
  )
}
