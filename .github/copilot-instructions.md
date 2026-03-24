# Copilot Instructions

This repository is a boilerplate for Apps in Toss web apps.

- Prefer official Apps in Toss docs before guessing:
  - https://developers-apps-in-toss.toss.im/llms.txt
  - https://developers-apps-in-toss.toss.im/llms-full.txt
- Keep the starter runnable without service-specific backend logic.
- Extend the existing modules instead of bypassing them:
  - `src/auth.ts`
  - `src/api/client.ts`
  - `src/monitoring.ts`
  - `src/debugRuntimeMode.ts`
  - `src/pages/DebugPage.tsx`
- Avoid leaking tokens, auth headers, or other secrets in logs.
- Before completing work, verify with `pnpm typecheck`, `pnpm lint`, and `pnpm test`.
