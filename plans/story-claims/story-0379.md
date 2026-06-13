# story-0379
- title: Shared plan editing: contract coverage
- owner: fine-dining-monitor
- claimedAt: 2026-06-13T15:43:54Z
- branch: codex/story-0379-shared-plan-editing-contract-coverage-20260613
- intendedTestPlan: `node --test frontend/src/tests/unit/household-planning.shared-plan-editing.contract-coverage.test.ts && npm --prefix frontend run test:unit && npm --prefix frontend run typecheck`
- filesExpectedToChange:
  - frontend/src/graphql/typeDefs.ts
  - frontend/src/graphql/resolvers/mutations/householdMutations.ts
  - frontend/src/tests/unit/household-planning.shared-plan-editing.contract-coverage.test.ts
  - plans/story-board.jsonl
  - plans/story-board.md

## Outcome
- status: done
- completedAt: 2026-06-13T15:47:12Z
- summary: Household updates now require a matching `expectedUpdatedAt` token and reject stale edits before save.

## Verification
- `NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npm exec -- tsx --test src/tests/unit/household-planning.shared-plan-editing.contract-coverage.test.ts`
- `npm run test:unit`
- `npm run typecheck`

## Changed Files
- frontend/src/graphql/resolvers/mutations/householdMutations.ts
- frontend/src/graphql/typeDefs.ts
- frontend/src/tests/unit/household-planning.shared-plan-editing.contract-coverage.test.ts
- plans/story-board.jsonl
- plans/story-board.md
- plans/story-claims/story-0379.md

## Follow-Ups
- None
