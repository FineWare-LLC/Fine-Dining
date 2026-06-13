story id: story-0411
title: Guest meals: persistence consistency
owner: fine-dining-monitor
claimedAt: 2026-06-13T21:12:59Z
branch: codex/story-0411-guest-meals-persistence-consistency
outcome: done
completedAt: 2026-06-13T21:20:15Z
intendedTestPlan:
- Add a focused guest-meals persistence-consistency test around updateHousehold and refresh reads.
- Run the targeted guest-meals persistence test first.
- Run `npm --prefix frontend run typecheck`.
filesExpectedToChange:
- frontend/src/graphql/resolvers/mutations/householdMutations.ts
- frontend/src/graphql/resolvers/queries/householdQueries.ts
- frontend/src/tests/unit/household-planning.guest-meals.persistence-consistency.test.ts
- plans/story-board.jsonl
- plans/story-board.md
verification:
- `cd frontend && NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npm exec -- tsx --test src/tests/unit/household-planning.guest-meals.contract-coverage.test.ts src/tests/unit/household-planning.guest-meals.failure-path.test.ts src/tests/unit/household-planning.guest-meals.persistence-consistency.test.ts src/tests/unit/household-planning.plan-approval.scale-boundary.test.ts src/tests/unit/household-planning.shopping-ownership.scale-boundary.test.ts`
- `npm --prefix frontend run typecheck`
- `npm --prefix frontend run test:unit` (fails on pre-existing `household-planning.preference-conflicts.failure-path.test.ts`)
changedFiles:
- frontend/src/graphql/resolvers/mutations/householdMutations.ts
- frontend/src/tests/unit/household-planning.guest-meals.persistence-consistency.test.ts
- frontend/src/utils/householdGuest.ts
- plans/story-board.jsonl
- plans/story-board.md
followUpStoriesAdded: none
