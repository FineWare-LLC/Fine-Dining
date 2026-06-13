# story-0373
- title: Member invites: scale boundary
- owner: fine-dining-monitor
- claimedAt: 2026-06-13T14:44:12Z
- branch: codex/story-0373-member-invites-scale-boundary
- model: GPT-5
- reasoning effort: high
- intended test plan:
  - `npm --prefix frontend run test:unit`
  - `npm --prefix frontend run typecheck`
- files expected to change:
  - `frontend/src/models/Household/householdSchema.ts`
  - `frontend/src/tests/unit/household-planning.member-invites.scale-boundary.test.ts`
  - `plans/story-board.jsonl`
- note: keep invite acceptance deterministic at the large-household boundary without adding extra array churn.

## Outcome
- status: done
- verification:
  - `env NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npm exec -- tsx --test src/tests/unit/household-planning.member-invites.scale-boundary.test.ts`
  - `env NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npm exec -- tsx --test src/tests/unit/household-planning.member-invites.contract-coverage.test.ts src/tests/unit/household-planning.member-invites.failure-path.test.ts src/tests/unit/household-planning.member-invites.persistence-consistency.test.ts src/tests/unit/household-planning.member-invites.scale-boundary.test.ts`
  - `npm --prefix frontend run test:unit`
  - `npm --prefix frontend run typecheck`
- changed files:
  - `frontend/src/models/Household/householdSchema.ts`
  - `frontend/src/tests/unit/household-planning.member-invites.scale-boundary.test.ts`
  - `plans/story-board.jsonl`
  - `plans/story-board.md`
- follow-up stories added: none
