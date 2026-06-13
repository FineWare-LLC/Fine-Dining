story id: story-0391
title: Child restrictions: persistence consistency
owner: fine-dining-monitor
claimedAt: 2026-06-13T17:57:32Z
branch: codex/story-0391-child-restrictions-persistence-consistency
intended test plan:
- Add a focused persistence-consistency regression for child restrictions and session refresh behavior.
- Run the new targeted test first.
- Run `npm --prefix frontend run test:unit`.
- Run `npm --prefix frontend run typecheck`.
files expected to change:
- frontend/src/tests/unit/household-planning.child-restrictions.persistence-consistency.test.ts
- frontend/src/context/authUtils.ts
- frontend/src/services/mealPlanGenerator.ts
- frontend/src/graphql/resolvers/queries/userQueries.ts
outcome: done
verification:
- `npm exec -- tsx --test src/tests/unit/household-planning.child-restrictions.persistence-consistency.test.ts`
- `npm exec -- tsx --test src/tests/unit/household-planning.child-restrictions.contract-coverage.test.ts src/tests/unit/household-planning.child-restrictions.failure-path.test.ts src/tests/unit/household-planning.child-restrictions.persistence-consistency.test.ts`
- `npm run test:unit` (failed on pre-existing `src/tests/unit/household-planning.preference-conflicts.failure-path.test.ts`)
- `npm run typecheck`
changed files:
- frontend/src/tests/unit/household-planning.child-restrictions.persistence-consistency.test.ts
- frontend/src/utils/substitutionSuggestions.ts
- plans/story-board.jsonl
- plans/story-board.md
- plans/story-claims/story-0391.md
follow-up stories added:
- none
