story id: story-0413
title: Guest meals: scale boundary
owner: fine-dining-monitor
claimedAt: 2026-06-13T21:32:29Z
branch: codex/story-0413-guest-meals-scale-boundary
model: GPT-5
outcome: done
completedAt: 2026-06-13T21:36:18Z
intended test plan:
- Start with performance, concurrency, pagination, and large-fixture tests for guest meals; use frontend/src/tests/unit/household-planning.guest-meals.scale-boundary.test.ts if no better local test file already exists.
- Run the targeted guest-meals scale-boundary test first.
- Run `npm --prefix frontend run typecheck`.
- Run `npm --prefix frontend run test:unit` if the targeted test passes.
filesExpectedToChange:
- frontend/src/models/User/subSchemas/preferencesSchema.ts
- frontend/src/models/Household/householdSchema.ts
- frontend/src/graphql/resolvers/mutations/householdMutations.ts
- frontend/src/graphql/resolvers/queries/householdQueries.ts
- frontend/src/tests/unit/household-planning.guest-meals.scale-boundary.test.ts
- plans/story-board.jsonl
- plans/story-board.md
verification:
- `NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npm exec -- tsx --test src/tests/unit/household-planning.guest-meals.scale-boundary.test.ts`
- `npm --prefix frontend run typecheck`
- `NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npm exec -- tsx --test src/tests/unit/household-planning.guest-meals.contract-coverage.test.ts src/tests/unit/household-planning.guest-meals.failure-path.test.ts src/tests/unit/household-planning.guest-meals.persistence-consistency.test.ts src/tests/unit/household-planning.guest-meals.operator-feedback.test.ts src/tests/unit/household-planning.guest-meals.scale-boundary.test.ts`
- `npm --prefix frontend run test:unit` (fails on pre-existing `frontend/src/tests/unit/household-planning.preference-conflicts.failure-path.test.ts`)
changedFiles:
- frontend/src/graphql/resolvers/mutations/householdMutations.ts
- frontend/src/tests/unit/household-planning.guest-meals.scale-boundary.test.ts
- plans/story-board.jsonl
- plans/story-board.md
followUpStoriesAdded: none
