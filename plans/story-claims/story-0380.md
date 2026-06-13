# story-0380
- title: Shared plan editing: failure path
- owner: fine-dining-monitor
- claimedAt: 2026-06-13T15:52:47Z
- branch: codex/story-0380-shared-plan-editing-failure-path
- model: GPT-5
- reasoning effort: standard
- intendedTestPlan: `NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npm exec -- tsx --test src/tests/unit/household-planning.shared-plan-editing.failure-path.test.ts && npm --prefix frontend run typecheck`
- filesExpectedToChange:
  - frontend/src/graphql/resolvers/mutations/householdMutations.ts
  - frontend/src/tests/unit/household-planning.shared-plan-editing.failure-path.test.ts
  - plans/story-board.jsonl
  - plans/story-board.md

## Outcome
- status: done
- completedAt: 2026-06-13T15:59:36Z
- summary: Shared plan edits now roll back a failed populate step and return a user-safe persistence error.

## Verification
- `NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npm exec -- tsx --test src/tests/unit/household-planning.shared-plan-editing.failure-path.test.ts`
- `NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npm exec -- tsx --test src/tests/unit/household-planning.shared-plan-editing.contract-coverage.test.ts src/tests/unit/household-planning.shared-plan-editing.failure-path.test.ts src/tests/unit/household-planning.preference-conflicts.failure-path.test.ts`
- `npm --prefix frontend run test:unit`
- `npm --prefix frontend run typecheck`

## Changed Files
- frontend/src/graphql/resolvers/mutations/householdMutations.ts
- frontend/src/tests/unit/household-planning.shared-plan-editing.failure-path.test.ts
- plans/story-board.jsonl
- plans/story-board.md
- plans/story-claims/story-0380.md

## Follow-Ups
- None
