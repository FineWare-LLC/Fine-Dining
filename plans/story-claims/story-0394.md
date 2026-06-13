story id: story-0394
title: Plan approval: contract coverage
owner: fine-dining-monitor
claimedAt: 2026-06-13T18:17:09Z
branch: codex/story-0394-plan-approval-contract-coverage
model: GPT-5
reasoningEffort: medium
intendedTestPlan:
- Add a focused contract-coverage regression test for household plan approval validation.
- Run the targeted unit test first.
- Run `npm --prefix frontend run test:unit`.
- Run `npm --prefix frontend run typecheck`.
filesExpectedToChange:
- frontend/src/utils/householdPlanApproval.ts
- frontend/src/models/Household/householdSchema.ts
- frontend/src/graphql/resolvers/mutations/householdMutations.ts
- frontend/src/graphql/typeDefs.ts
- frontend/src/tests/unit/household-planning.plan-approval.contract-coverage.test.ts
- plans/story-board.jsonl
- plans/story-board.md

## Completion

- outcome: done
- completedAt: 2026-06-13T18:21:51Z
- verification:
  - `NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npx tsx --test src/tests/unit/household-planning.plan-approval.contract-coverage.test.ts`
  - `NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npx tsx --test src/tests/unit/household-planning.shared-plan-editing.contract-coverage.test.ts src/tests/unit/household-planning.shared-plan-editing.failure-path.test.ts src/tests/unit/household-planning.shared-plan-editing.persistence-consistency.test.ts`
  - `npm --prefix frontend run typecheck`
  - `npm --prefix frontend run test:unit` failed on pre-existing `frontend/src/tests/unit/household-planning.preference-conflicts.failure-path.test.ts`
- changedFiles:
  - `frontend/src/utils/householdPlanApproval.ts`
  - `frontend/src/models/Household/householdSchema.ts`
  - `frontend/src/graphql/resolvers/mutations/householdMutations.ts`
  - `frontend/src/graphql/typeDefs.ts`
  - `frontend/src/tests/unit/household-planning.plan-approval.contract-coverage.test.ts`
  - `plans/story-board.jsonl`
  - `plans/story-board.md`
- followUpStoriesAdded: none
