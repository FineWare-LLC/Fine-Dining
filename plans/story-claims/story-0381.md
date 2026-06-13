story id: story-0381
title: Shared plan editing: persistence consistency
owner: codex
claimedAt: 2026-06-13T16:02:03Z
branch: codex/story-0381-shared-plan-editing-persistence-consistency
model: GPT-5
reasoningEffort: medium
intendedTestPlan: npm --prefix frontend run test:unit && npm --prefix frontend run typecheck
filesExpectedToChange:
- frontend/src/graphql/resolvers/queries/householdQueries.ts
- frontend/src/models/Household/householdSchema.ts
- frontend/src/graphql/resolvers/mutations/householdMutations.ts
- frontend/src/tests/unit/household-planning.shared-plan-editing.persistence-consistency.test.ts

outcome: done
verification:
- `NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npx tsx --test src/tests/unit/household-planning.shared-plan-editing.contract-coverage.test.ts src/tests/unit/household-planning.shared-plan-editing.failure-path.test.ts src/tests/unit/household-planning.shared-plan-editing.persistence-consistency.test.ts`
- `npm --prefix frontend run test:unit` failed in `frontend/src/tests/unit/household-planning.preference-conflicts.failure-path.test.ts` with a pre-existing `expectedUpdatedAt` mismatch
- `npm --prefix frontend run typecheck`
changedFiles:
- frontend/src/graphql/resolvers/mutations/householdMutations.ts
- frontend/src/tests/unit/household-planning.shared-plan-editing.contract-coverage.test.ts
- frontend/src/tests/unit/household-planning.shared-plan-editing.failure-path.test.ts
- frontend/src/tests/unit/household-planning.shared-plan-editing.persistence-consistency.test.ts
- plans/story-board.jsonl
- plans/story-board.md
followUpStoriesAdded: none
