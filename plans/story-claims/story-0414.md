story id: story-0414
title: Household deletion: contract coverage
owner: fine-dining-monitor
claimedAt: 2026-06-13T21:45:22Z
branch: codex/story-0414-household-deletion-contract-coverage
model: GPT-5
reasoningEffort: medium
intendedTestPlan:
- Add a focused contract test for household deletion input validation and successful cleanup behavior.
- Run the focused household deletion test first.
- Run `npm --prefix frontend run test:unit`.
- Run `npm --prefix frontend run typecheck`.
filesExpectedToChange:
- frontend/src/graphql/resolvers/mutations/householdMutations.ts
- frontend/src/tests/unit/household-planning.household-deletion.contract-coverage.test.ts
- plans/story-board.jsonl
outcome: done
verification:
- `NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npm exec -- tsx --test src/tests/unit/household-planning.household-deletion.contract-coverage.test.ts`
- `npm run typecheck`
- `npm run test:unit` (failed on unrelated `household-planning.preference-conflicts.failure-path.test.ts`)
changedFiles:
- frontend/src/graphql/resolvers/mutations/householdMutations.ts
- frontend/src/tests/unit/household-planning.household-deletion.contract-coverage.test.ts
- plans/story-board.jsonl
- plans/story-board.md
followUpStoriesAdded: none
