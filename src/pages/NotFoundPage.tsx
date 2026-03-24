import { useNavigate } from 'react-router-dom'
import { Button, Paragraph } from '@toss/tds-mobile'
import { colors } from '@toss/tds-colors'
import { Page, Screen } from '../components/Layout'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <Screen>
      <Page style={{ justifyContent: 'center' }}>
        <section className="boilerplate-card">
          <Paragraph typography="t3" color={colors.grey900} fontWeight="bold" style={{ margin: 0 }}>
            페이지를 찾을 수 없어요
          </Paragraph>
          <Paragraph
            typography="t6"
            color={colors.grey700}
            style={{ margin: '8px 0 0', lineHeight: 1.55 }}
          >
            보일러플레이트 기본 경로는 `/`, `/home`, `/debug` 입니다.
          </Paragraph>
          <div className="boilerplate-actions" style={{ marginTop: 16 }}>
            <Button color="primary" onClick={() => navigate('/')}>
              처음으로
            </Button>
          </div>
        </section>
      </Page>
    </Screen>
  )
}
