story id: story-0409
title: Guest meals: contract coverage
owner: fine-dining-monitor
claimedAt: 2026-06-13T20:56:07Z
branch: codex/story-0409-guest-meals-contract-coverage
outcome: done
completedAt: 2026-06-13T21:04:24Z
intendedTestPlan:
- Add a focused guest-meals contract test for canonical payload validation and refresh behavior.
- Run the targeted guest-meals unit test first.
- Run `npm --prefix frontend run typecheck`.
filesExpectedToChange:
- frontend/src/utils/householdGuest.ts
- frontend/src/graphql/resolvers/queries/householdQueries.ts
- frontend/src/graphql/resolvers/mutations/householdMutations.ts
- frontend/src/tests/unit/household-planning.guest-meals.contract-coverage.test.ts
- plans/story-board.jsonl
- plans/story-board.md
verification:
- `NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npm --prefix frontend exec -- tsx --test src/tests/unit/household-planning.guest-meals.contract-coverage.test.ts`
- `NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npm --prefix frontend exec -- tsx --test src/tests/unit/household-planning.guest-meals.contract-coverage.test.ts src/tests/unit/household-planning.per-member-servings.persistence-consistency.test.ts src/tests/unit/household-planning.shared-plan-editing.scale-boundary.test.ts src/tests/unit/household-planning.preference-conflicts.failure-path.test.ts`
- `npm --prefix frontend run typecheck`
- `npm --prefix frontend run test:unit` (fails on pre-existing `household-planning.preference-conflicts.failure-path.test.ts`)
changedFiles:
- frontend/src/utils/householdGuest.ts
- frontend/src/graphql/resolvers/mutations/householdMutations.ts
- frontend/src/graphql/resolvers/queries/householdQueries.ts
- frontend/src/tests/unit/household-planning.guest-meals.contract-coverage.test.ts
- plans/story-board.jsonl
- plans/story-board.md
- plans/story-claims/story-0409.md
followUpStoriesAdded: none
