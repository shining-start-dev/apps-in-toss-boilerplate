# Apps In Toss LLM Context Rules

Always use Apps in Toss official context first:

- https://developers-apps-in-toss.toss.im/llms.txt
- https://developers-apps-in-toss.toss.im/llms-full.txt

Guidelines:

- Prefer `llms.txt` first for concise context.
- If docs are ambiguous, check `llms-full.txt`.
- Keep implementation and answers aligned with the official Apps in Toss docs.

Project rules:

- This repository is a reusable Apps in Toss boilerplate. Keep domain logic optional and keep the starter runnable.
- Before adding a dependency, utility, or framework pattern, search `src/`, `README.md`, and existing config first.
- Keep `auth`, `api`, `monitoring`, and `debug` modules generic enough to be copied into service repos.
- Before finishing a change, run `pnpm typecheck`, `pnpm lint`, and `pnpm test`. If build or runtime config changed, also run `pnpm build:web`.
- If verification cannot run because dependencies or environment are missing, state that explicitly.

Security rules:

- Never commit tokens, secrets, local credentials, or `.env` files.
- Never log JWTs, authorization codes, auth headers, or raw sensitive payloads.
- Keep local-only debug behavior behind `VITE_ENABLE_DEBUG_TOOLS` or `import.meta.env.DEV`.
- Keep Apps in Toss login behavior consistent with the official docs.

Command rule:

- If the user says `배포해줘`, run `pnpm build && npx ait deploy`.
