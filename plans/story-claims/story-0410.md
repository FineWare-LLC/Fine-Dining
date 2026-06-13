story id: story-0410
title: Guest meals: failure path
owner: fine-dining-monitor
claimedAt: 2026-06-13T21:03:58Z
branch: codex/story-0410-guest-meals-failure-path
intendedTestPlan:
- Add a focused guest-meals failure-path test that forces a downstream populate or save failure.
- Run the targeted guest-meals unit test first.
- Run `npm --prefix frontend run typecheck`.
filesExpectedToChange:
- frontend/src/graphql/resolvers/mutations/householdMutations.ts
- frontend/src/tests/unit/household-planning.guest-meals.failure-path.test.ts
- plans/story-board.jsonl

## Completion

outcome: done

verification:
- `NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npx tsx --test src/tests/unit/household-planning.guest-meals.failure-path.test.ts`
- `npm --prefix frontend run test:unit` (one unrelated pre-existing failure in `frontend/src/tests/unit/household-planning.preference-conflicts.failure-path.test.ts`)
- `npm --prefix frontend run typecheck`

changedFiles:
- frontend/src/graphql/resolvers/mutations/householdMutations.ts
- frontend/src/tests/unit/household-planning.guest-meals.failure-path.test.ts
- plans/story-board.jsonl
- plans/story-board.md

followUpStoriesAdded:
- none
