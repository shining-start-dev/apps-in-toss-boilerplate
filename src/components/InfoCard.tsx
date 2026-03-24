import type { ReactNode } from 'react'
import { Paragraph } from '@toss/tds-mobile'
import { colors } from '@toss/tds-colors'

type InfoCardProps = {
  title: string
  description?: string
  statusLabel?: string
  statusTone?: 'success' | 'neutral' | 'warning'
  children: ReactNode
}

export function InfoCard({
  title,
  description,
  statusLabel,
  statusTone = 'neutral',
  children,
}: InfoCardProps) {
  return (
    <section className="boilerplate-card">
      <div className="boilerplate-card-head">
        <div>
          <Paragraph typography="t4" color={colors.grey900} fontWeight="bold" style={{ margin: 0 }}>
            {title}
          </Paragraph>
          {description ? (
            <Paragraph
              typography="t6"
              color={colors.grey700}
              style={{ margin: '4px 0 0', lineHeight: 1.5 }}
            >
              {description}
            </Paragraph>
          ) : null}
        </div>
        {statusLabel ? (
          <span className={`boilerplate-status boilerplate-status-${statusTone}`}>{statusLabel}</span>
        ) : null}
      </div>
      {children}
    </section>
  )
}
