# Claude Project Rules

This repository is an Apps in Toss starter kit.

Use these rules when working here:

- Prioritize official Apps in Toss docs:
  - https://developers-apps-in-toss.toss.im/llms.txt
  - https://developers-apps-in-toss.toss.im/llms-full.txt
- Preserve the starter quality. Keep examples useful but generic.
- Reuse the existing `auth`, `api`, `monitoring`, and `debug` modules before inventing new abstractions.
- Treat `src/pages/DebugPage.tsx`, `src/debugRuntimeMode.ts`, and `src/monitoring.ts` as template-grade infrastructure.
- Run `pnpm typecheck`, `pnpm lint`, and `pnpm test` before wrapping up. If config or build flow changes, also run `pnpm build:web`.

Safety:

- Never commit secrets or local environment files.
- Never expose auth tokens or authorization codes in logs or UI.
- Keep any debug-only behavior disabled by default in production.
