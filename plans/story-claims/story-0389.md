story id: story-0389
title: Child restrictions: contract coverage
owner: fine-dining-monitor
claimedAt: 2026-06-13T17:39:43Z
branch: codex/story-0389-child-restrictions-contract-coverage
intended test plan:
- Add a focused contract test for child restrictions and hard meal filtering.
- Run the new targeted test first.
- Run `npm --prefix frontend run test:unit`.
- Run `npm --prefix frontend run typecheck`.
files expected to change:
- frontend/src/services/mealPlanGenerator.ts
- frontend/src/graphql/typeDefs.ts
- frontend/src/tests/unit/household-planning.child-restrictions.contract-coverage.test.ts
outcome: done
completedAt: 2026-06-13T17:46:05Z
verification:
- `NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npx tsx --test src/tests/unit/household-planning.child-restrictions.contract-coverage.test.ts`
- `npm --prefix frontend run test:unit` (passed for this story; failed on pre-existing `household-planning.preference-conflicts.failure-path.test.ts`)
- `npm --prefix frontend run typecheck`
changed files:
- frontend/src/services/mealPlanGenerator.ts
- frontend/src/graphql/typeDefs.ts
- frontend/src/tests/unit/household-planning.child-restrictions.contract-coverage.test.ts
- frontend/src/utils/householdChildRestrictions.ts
- frontend/src/utils/substitutionSuggestions.ts
- plans/story-board.jsonl
- plans/story-board.md
follow-up stories added: none
known blockers:
- The frontend unit suite still has a pre-existing failure in `frontend/src/tests/unit/household-planning.preference-conflicts.failure-path.test.ts`.
