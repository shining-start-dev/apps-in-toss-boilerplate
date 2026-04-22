# 프로젝트 시작 체크리스트

이 문서는 이 보일러플레이트를 새 서비스 레포로 복제한 뒤 무엇부터 해야 하는지, 어떤 MCP와 도구를 붙여야 하는지 정리한 문서입니다.

아래 공식 문서를 기준으로 보정했습니다.

- WebView 시작 가이드: https://developers-apps-in-toss.toss.im/tutorials/webview.md
- 공통 설정 (`granite.config.ts`): https://developers-apps-in-toss.toss.im/bedrock/reference/framework/UI/Config.md
- `appLogin`: https://developers-apps-in-toss.toss.im/bedrock/reference/framework/로그인/appLogin.md
- `getAnonymousKey`: https://developers-apps-in-toss.toss.im/bedrock/reference/framework/비게임/getAnonymousKey.md
- 내비게이션 바 설정: https://developers-apps-in-toss.toss.im/bedrock/reference/framework/UI/NavigationBar.md

2026년 3월 23일 기준 공식 문서에는 Apps in Toss 파트너사가 SDK 2.x로 마이그레이션해야 한다고 안내되어 있습니다. 이 보일러플레이트도 그 기준에 맞춰 `@apps-in-toss/web-framework` 2.x 계열을 사용합니다.

## 1. 레포를 복제한 직후 할 일

- `package.json`의 프로젝트 이름을 서비스 이름으로 바꾸기
- `granite.config.ts`의 `appName`, `brand.displayName`, `brand.primaryColor`, `brand.icon` 수정
  - 공식 문서 기준 `appName`은 콘솔에 등록한 앱 이름과 같아야 함
  - `brand.displayName`도 콘솔 기준 사용자 노출 이름과 맞추는 것이 안전함
- `src/api/endpoints.ts`의 엔드포인트 경로를 실제 서버 계약에 맞게 변경
- `src/auth.ts`의 로그인 응답 타입과 로그인 API 계약 확인
- 비게임 앱이면 `src/anonymousKey.ts`의 `getAnonymousKey` 활용 여부 확인
- `README.md` 상단 설명을 서비스 설명으로 교체
- `public/favicon.svg`를 서비스 아이콘으로 교체
- `granite.config.ts`의 `webViewProps.type`이 서비스 성격에 맞는지 확인
  - 비게임: `partner`
  - 게임: `game`
- `granite.config.ts`의 `navigationBar`가 서비스 플로우와 맞는지 확인

## 2. 환경 변수 세팅

`.env.example`를 참고해서 `.env.development`를 만듭니다.

필수 확인 항목:

- `AIT_WEB_HOST`
  - Sandbox 앱이 접속할 현재 개발 PC의 Wi-Fi IPv4
- `VITE_AIP_SERVER_BASE_URL`
  - 공통 API 서버를 절대경로로 붙일 때 사용
- `VITE_DEV_API_BASE_URL`
  - 디버그 모드에서 dev 서버를 강제로 볼 때 사용
- `VITE_PROD_API_BASE_URL`
  - 디버그 모드에서 live 서버를 강제로 볼 때 사용
- `VITE_ENABLE_DEBUG_TOOLS=true`
  - `/debug` 페이지를 계속 쓰려면 켜두기

공식 문서 기준 추가 확인:

- `granite.config.ts`의 `web.host`는 실기기에서 접근 가능한 주소여야 함
- `web.commands.dev`에는 `vite --host`처럼 외부 접속 가능한 개발 서버 명령이 들어가야 함
- `outdir`와 실제 웹 빌드 결과물 경로가 같아야 `.ait` 패키징이 정상 동작함

선택 항목:

- `VITE_AIP_FORCE_APP_LOGIN=true`
  - 저장된 토큰을 무시하고 매번 `appLogin` 테스트
- `VITE_SENTRY_DSN`
- `VITE_SENTRY_ENVIRONMENT`
- `VITE_SENTRY_RELEASE`
- `VITE_SENTRY_TRACES_SAMPLE_RATE`

## 3. 화면/기능 커스터마이징 순서

추천 순서:

1. `src/pages/HomePage.tsx`를 실제 서비스 홈으로 교체
2. `src/pages/IntroPage.tsx`를 서비스 인트로/진입 화면으로 교체
3. `src/pages/DebugPage.tsx`에 서비스용 디버그 액션 추가
4. `src/api/client.ts` 위에 서비스 API 함수 파일 추가
5. `src/components/`에 공통 카드, 배너, CTA, 에러 상태 컴포넌트 추가

유지 권장:

- `src/auth.ts`
- `src/monitoring.ts`
- `src/debugRuntimeMode.ts`
- `src/runtime.ts`
- `src/providers.tsx`

이 파일들은 서비스별 수정은 가능하지만, 보통은 그대로 두고 서비스 로직만 얹는 편이 안전합니다.

## 4. 로그인/런타임 테스트

브라우저와 실제 WebView 테스트를 나눠서 보세요.

브라우저에서 확인할 것:

- `pnpm dev:web` 실행
- 레이아웃, 라우팅, 상태 표시, `/debug` 동작 확인
- 상대 경로 API 프록시가 필요한지 확인

Sandbox 앱에서 확인할 것:

- `pnpm dev` 실행
- Sandbox 앱 개발자 로그인 완료 여부 확인
- 앱 진입 후 `appLogin` 성공 여부 확인
- API 호출이 올바른 base URL로 가는지 확인
- `/debug`에서 runtime mode 전환 후 동작 확인

실제 Toss WebView에서 확인할 것:

- `appLogin`이 `DEFAULT` 흐름으로 서버에 전달되는지 확인
- `getOperationalEnvironment()`가 기대값으로 잡히는지 확인
- bridge provider(`TDSMobileAITProvider`)가 제대로 동작하는지 확인
- 비게임 앱이면 `getAnonymousKey`가 기대한 형식의 키를 반환하는지 확인

`appLogin` 공식 문서 기준 주의사항:

- 클라이언트는 `authorizationCode`와 `referrer`만 받음
- 토큰 교환과 사용자 정보 조회는 반드시 서버에서 처리해야 함
- `authorizationCode`는 유효시간이 짧고 일회성이므로 클라이언트에 장기 저장하면 안 됨

`getAnonymousKey` 공식 문서 기준 주의사항:

- 비게임 미니앱에서만 사용
- SDK 2.4.5+ 또는 지원 앱 버전에서만 동작
- 서버 API 호출용 키가 아니라 내부 식별/데이터 관리용 키

## 5. 디버그 툴에 꼭 넣어둘 것

`src/pages/DebugPage.tsx`에는 아래 항목을 유지하거나 추가하는 것을 권장합니다.

- 현재 runtime mode (`auto`, `live`, `dev`)
- resolved operational environment (`local`, `sandbox`, `toss`)
- 저장된 auth token 존재 여부
- 토큰 초기화 버튼
- `appLogin` 재실행 버튼
- API base URL / 배포 환경 표시
- 서비스별 실험 플래그 또는 Remote Config 값 확인 버튼
- 관리자 페이지, 프리뷰 페이지, QA 페이지로 가는 링크

## 6. 모니터링 / 운영 세팅

Sentry를 쓸 계획이면 초기에 바로 붙이는 편이 낫습니다.

해야 할 일:

- `VITE_SENTRY_DSN` 설정
- 배포 시 release 값 규칙 정하기
- `deploymentId` 태그를 기준으로 이슈를 추적할지 결정
- source map 업로드가 필요하면 `package.json`에 `sentry-cli` 스크립트 추가
- 에러 화면에서 event id를 QA가 복사해 전달할 수 있게 유지

공식 문서 기준 운영 쪽에서 같이 봐야 하는 것:

- 콘솔에 등록한 앱 정보와 `granite.config.ts`의 브랜드 정보가 맞는지
- 내비게이션 바 타입이 서비스 성격과 맞는지
- 필요한 권한이 있으면 `permissions`에 명시했는지

## 7. 배포 전 체크

배포 전에 최소한 아래는 확인하세요.

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm build:web`
- 실제 Sandbox 앱에서 로그인 1회 성공
- API 1개 이상 실호출 성공
- `/debug`에서 토큰 초기화와 runtime mode 전환 확인
- Sentry DSN 사용 시 에러 이벤트 전송 확인

## MCP / 도구 가이드

이 프로젝트에서 추천하는 MCP와 도구를 필수/권장으로 나눠서 정리합니다.

### 필수 MCP

#### 1. Apps in Toss 문서 MCP

용도:

- Apps in Toss 공식 문서 검색
- SDK/API 사용법 확인
- 샌드박스 / WebView / 권한 / 배포 규칙 확인
- LLM이 Apps in Toss 문맥으로 답하게 만들기

왜 필수인가:

- 이 프로젝트는 일반 웹앱이 아니라 Apps in Toss 런타임을 타기 때문에, 공식 문서를 기준으로 구현해야 오작동이 적습니다.
- 특히 `appLogin`, `getOperationalEnvironment`, 배포 규칙, WebView 제약은 기억에 의존하면 틀리기 쉽습니다.
- `granite.config.ts`의 `appName`, `web.host`, `webViewProps.type`, `permissions` 같은 항목은 문서 기준으로 맞춰야 테스트/배포 문제가 줄어듭니다.

추천 사용 시점:

- 인증 구현 전
- 배포 전
- 권한/브리지 API 붙일 때
- 에러 원인이 브리지인지 서버인지 구분이 안 될 때

### 권장 MCP / 문서 도구

#### 2. OpenAI Docs MCP

용도:

- 이 앱에 OpenAI API를 붙일 계획이 있을 때만 사용
- 모델 선택, 응답 형식, 최신 API 문서 확인

필수 여부:

- OpenAI 연동이 없으면 불필요

### 필수 로컬 도구

#### 1. Node.js 20+

용도:

- Vite, TypeScript, Vitest, Apps in Toss 툴체인 실행

#### 2. pnpm

용도:

- 의존성 설치
- 스크립트 실행
- lockfile 관리

이 레포 기본 명령:

- `pnpm install`
- `pnpm dev`
- `pnpm dev:web`
- `pnpm verify`
- `pnpm build`

#### 3. Toss Sandbox 앱

용도:

- `appLogin` 테스트
- 실제 Apps in Toss WebView 환경 확인
- 로컬 개발 서버 접속 확인

이 도구 없이는 확인하기 어려운 것:

- 브라우저에서는 재현 안 되는 bridge 동작
- 샌드박스 세션 만료/로그인 이슈
- `RequestSerializerError` 계열 문제
- 실기기에서 `web.host`와 개발 서버 연결이 실제로 되는지 여부

공식 문서 기준:

- 샌드박스 앱 설치는 필수
- iOS는 같은 Wi-Fi와 로컬 네트워크 권한이 중요
- Android는 `adb reverse tcp:8081 tcp:8081`, `adb reverse tcp:5173 tcp:5173` 같은 연결이 필요할 수 있음

### 강력 권장 도구

#### 4. `sentry-cli`

용도:

- source map 업로드
- 릴리즈 확인
- Sentry 이슈 조회

권장 시점:

- 프로덕션 에러 추적이 필요할 때
- 배포 자동화에 source map 업로드를 붙일 때

#### 5. Playwright

용도:

- 브라우저 기준 주요 플로우 스모크 테스트
- 라우팅, 상태 변화, 기본 폼 테스트

주의:

- Apps in Toss WebView 고유 동작은 Playwright만으로 완전 대체되지 않습니다.
- WebView 브리지 관련 검증은 Sandbox 앱도 병행해야 합니다.

#### 6. Chrome DevTools

용도:

- 네트워크 요청 확인
- Local Storage, 렌더링, 콘솔 에러 확인
- 브라우저 미리보기 단계 디버깅

### 있으면 좋은 도구

#### 7. Prettier / ESLint 연동 에디터 플러그인

용도:

- 저장 시 포맷팅
- 타입/린트 오류 빠른 확인

#### 8. GitHub Copilot / Codex / Claude Code

용도:

- 반복적인 화면/유틸 작성
- Apps in Toss 문맥을 반영한 코드 수정

권장 설정:

- `AGENTS.md`
- `CLAUDE.md`
- `.github/copilot-instructions.md`

이 3개 파일을 프로젝트 규칙의 단일 기준점으로 유지하세요.

## AI 에이전트에게 시킬 때 기본 요청 예시

다음 요구를 같이 적어주면 품질이 올라갑니다.

- Apps in Toss 공식 문서 기준으로 작업할 것
- `src/auth.ts`, `src/monitoring.ts`, `src/debugRuntimeMode.ts`를 먼저 재사용할 것
- 새 의존성 추가 전 기존 코드에서 대체 가능한지 확인할 것
- 마무리 전에 `pnpm typecheck`, `pnpm lint`, `pnpm test`를 돌릴 것
- auth / env / monitoring 변경 시 보안 검토도 함께 할 것
