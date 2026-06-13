story id: story-0396
title: Plan approval: persistence consistency
owner: fine-dining-monitor
claimedAt: 2026-06-13T18:43:38Z
branch: codex/story-0396-plan-approval-persistence-consistency
model: GPT-5
reasoningEffort: medium
intendedTestPlan:
- Add a focused persistence-consistency regression test for household plan approval.
- Run the targeted unit test first.
- Run `npm --prefix frontend run test:unit`.
- Run `npm --prefix frontend run typecheck`.
filesExpectedToChange:
- frontend/src/models/Household/householdSchema.ts
- frontend/src/graphql/resolvers/mutations/householdMutations.ts
- frontend/src/graphql/resolvers/queries/householdQueries.ts
- frontend/src/tests/unit/household-planning.plan-approval.persistence-consistency.test.ts
- plans/story-board.jsonl
- plans/story-board.md
- plans/story-claims/story-0396.md

## Completion

- outcome: done
- completedAt: 2026-06-13T18:48:30Z
- verification:
  - `NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npm exec -- tsx --test src/tests/unit/household-planning.plan-approval.persistence-consistency.test.ts`
  - `NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npm exec -- tsx --test src/tests/unit/household-planning.plan-approval.contract-coverage.test.ts src/tests/unit/household-planning.plan-approval.failure-path.test.ts src/tests/unit/household-planning.plan-approval.persistence-consistency.test.ts src/tests/unit/household-planning.shared-plan-editing.persistence-consistency.test.ts src/tests/unit/household-planning.member-invites.persistence-consistency.test.ts src/tests/unit/household-planning.per-member-servings.persistence-consistency.test.ts`
  - `npm run typecheck`
  - `npm run test:unit` failed on pre-existing `frontend/src/tests/unit/household-planning.preference-conflicts.failure-path.test.ts`
- changedFiles:
  - `frontend/src/utils/householdPlanApproval.ts`
  - `frontend/src/graphql/resolvers/mutations/householdMutations.ts`
  - `frontend/src/graphql/resolvers/queries/householdQueries.ts`
  - `frontend/src/tests/unit/household-planning.plan-approval.persistence-consistency.test.ts`
  - `plans/story-board.jsonl`
  - `plans/story-board.md`
  - `plans/story-claims/story-0396.md`
- followUpStoriesAdded: none
