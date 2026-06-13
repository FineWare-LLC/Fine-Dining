story id: story-0395
title: Plan approval: failure path
owner: fine-dining-monitor
claimedAt: 2026-06-13T18:32:14Z
branch: codex/story-0395-plan-approval-failure-path
model: GPT-5
reasoningEffort: medium
intendedTestPlan:
- Add a focused failure-path regression test for plan approval.
- Run the targeted unit test first.
- Run `npm --prefix frontend run test:unit`.
- Run `npm --prefix frontend run typecheck`.
filesExpectedToChange:
- frontend/src/models/Household/householdSchema.ts
- frontend/src/graphql/resolvers/queries/householdQueries.ts
- frontend/src/graphql/resolvers/mutations/householdMutations.ts
- frontend/src/tests/unit/household-planning.plan-approval.failure-path.test.ts
- plans/story-board.jsonl
- plans/story-board.md

## Completion

- outcome: done
- completedAt: 2026-06-13T18:38:23Z
- verification:
  - `NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npm exec -- tsx --test src/tests/unit/household-planning.plan-approval.contract-coverage.test.ts src/tests/unit/household-planning.plan-approval.failure-path.test.ts`
  - `npm run typecheck`
  - `npm run test:unit` failed on pre-existing `household-planning.preference-conflicts.failure-path.test.ts`
- changedFiles:
  - `frontend/src/tests/unit/household-planning.plan-approval.failure-path.test.ts`
  - `plans/story-board.jsonl`
  - `plans/story-board.md`
  - `plans/story-claims/story-0395.md`
- followUpStoriesAdded: none
