# Apps in Toss Boilerplate

`time-is-gold-react`의 단순한 앱 구조와 `today-survey`의 성숙한 개발/운영 설정을 합쳐 만든 Apps in Toss 스타터 레포입니다.

공식 Apps in Toss 문서 기준으로 확인한 항목:

- WebView 시작 가이드: https://developers-apps-in-toss.toss.im/tutorials/webview.md
- 공통 설정 (`granite.config.ts`): https://developers-apps-in-toss.toss.im/bedrock/reference/framework/UI/Config.md
- `appLogin`: https://developers-apps-in-toss.toss.im/bedrock/reference/framework/로그인/appLogin.md

포함 내용:

- React + TypeScript + Vite
- Apps in Toss Web Framework 연동
- TDS Mobile / TDS Mobile AIT Provider
- appLogin 기반 인증 템플릿
- API 클라이언트 / 환경 변수 헬퍼
- Sentry 모니터링 초기화 템플릿
- 인앱 디버그 툴 (`/debug`)
- 브리지 Storage / localStorage 상태 비교 도구
- 런타임 모드 전환 (`auto`, `live`, `dev`)
- AI 협업 규칙 파일 (`AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md`)
- Vitest / ESLint / Prettier

## Quick Start

공식 WebView 시작 가이드도 Vite + React + TypeScript 기준을 사용합니다.

```bash
pnpm install
pnpm dev
```

웹 브라우저 미리보기만 필요하면:

```bash
pnpm dev:web
```

처음 세팅할 때는 아래 문서를 먼저 보세요.

- [프로젝트 시작 체크리스트](./docs/setup-checklist.md)
- [MCP / 도구 가이드](./docs/setup-checklist.md#mcp--도구-가이드)

## Scripts

- `pnpm dev`: Apps in Toss 개발 서버 실행
- `pnpm dev:web`: 일반 Vite 웹 서버 실행
- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm verify`
- `pnpm build`
- `pnpm build:web`
- `pnpm deploy`

## Environment Variables

`.env.example`을 기준으로 `.env.development`를 만들어 사용하세요.

- `VITE_AIP_SERVER_BASE_URL`: 공통 API 서버 기본 주소
- `VITE_DEV_API_BASE_URL`: 디버그 모드 `dev`에서 강제할 서버 주소
- `VITE_PROD_API_BASE_URL`: 디버그 모드 `live`에서 강제할 서버 주소
- `AIT_WEB_HOST`: 샌드박스 앱에서 접속할 로컬 Wi-Fi IPv4
- `VITE_AIP_FORCE_APP_LOGIN=true`: 저장된 토큰을 무시하고 매번 appLogin 수행
- `VITE_ENABLE_DEBUG_TOOLS=true`: `/debug` 노출
- `VITE_SENTRY_*`: 모니터링 설정

공식 문서 기준으로 `AIT_WEB_HOST`와 `web.commands.dev`의 `--host` 설정은 실기기/Sandbox 테스트에서 중요합니다.

## Structure

```text
src/
  api/                API config, endpoints, request client
  components/         공통 레이아웃, 에러 화면, 카드 UI
  pages/              Intro / Home / Debug / NotFound
  utils/              env, error, appError
  auth.ts             appLogin + token storage
  analytics.ts        Analytics bridge wrapper
  debugStorage.ts     bridge/local storage inspector
  debugRuntimeMode.ts 디버그 런타임 전환
  monitoring.ts       Sentry bootstrap
  providers.tsx       TDS provider selection
  runtime.ts          Apps in Toss WebView 감지
```

## What To Customize First

1. `granite.config.ts`의 `appName`과 브랜드 정보를 바꾸세요.
2. `src/api/endpoints.ts`의 엔드포인트를 실제 서비스용으로 바꾸세요.
3. `src/pages/HomePage.tsx`를 도메인 대시보드로 교체하세요.
4. `src/pages/DebugPage.tsx`와 `src/debugStorage.ts`에 서비스별 디버그 액션/키를 추가하세요.
5. `src/auth.ts`의 로그인 응답 타입과 서버 계약을 실제 백엔드에 맞추세요.

## Working Checklist

새 프로젝트를 만들면 최소한 아래 순서로 진행하세요.

1. 앱 이름, 브랜드, 아이콘 변경
2. `.env.development` 생성
3. 백엔드 엔드포인트와 로그인 계약 연결
4. `/home`과 `/debug` 화면을 서비스용으로 교체
5. Sandbox 앱에서 로그인과 API 호출 확인
6. `pnpm verify`와 `pnpm build:web` 통과 확인

상세 순서는 [docs/setup-checklist.md](./docs/setup-checklist.md)에 정리되어 있습니다.

## Official Docs Notes

이 템플릿 문서는 아래 공식 문서 내용을 반영해서 작성했습니다.

- `appLogin`은 클라이언트에서 인가 코드만 받고, 토큰 교환과 사용자 조회는 반드시 서버에서 처리해야 합니다.
- `authorizationCode`는 장기 저장하면 안 되고, 유효시간이 짧으며 일회성입니다.
- `granite.config.ts`의 `appName`은 Apps in Toss 콘솔에 등록한 앱 이름과 같아야 합니다.
- `web.host`와 `web.commands.dev`는 샌드박스 앱에서 접속 가능한 주소와 명령으로 맞춰야 합니다.
- Apps in Toss 파트너사는 2026년 3월 23일 이후 SDK 2.x로 빌드해야 합니다.

## Recommended MCP And Tools

필수/권장 도구는 아래 기준으로 쓰면 됩니다.

- 필수 MCP: Apps in Toss 문서 조회용 MCP
- 필수 패키지 매니저: `pnpm`
- 필수 런타임: Node.js 20+
- 필수 테스트 환경: Toss Sandbox 앱 또는 실제 Toss WebView
- 권장 도구: `sentry-cli`, Playwright, Chrome DevTools

왜 필요한지와 언제 쓰는지는 [docs/setup-checklist.md](./docs/setup-checklist.md#mcp--도구-가이드)에 적어두었습니다.

## Notes

- 브라우저에서는 appLogin이 동작하지 않습니다. 실제 로그인 테스트는 Toss WebView 또는 Sandbox 앱에서 하세요.
- 비게임 WebView 앱은 공식 가이드 기준 `@toss/tds-mobile` 사용이 사실상 필수입니다.
- 디버그 런타임 모드를 바꾸면 토큰을 정리하고 초기 화면으로 되돌립니다.
- `/debug`에서는 브리지 Storage와 localStorage에 저장된 핵심 키를 나란히 확인할 수 있습니다.
- 템플릿은 최소 동작만 제공합니다. 백엔드 API 계약과 도메인 로직은 직접 채워야 합니다.
