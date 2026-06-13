story id: story-0390
title: Child restrictions: failure path
owner: fine-dining-monitor
claimedAt: 2026-06-13T17:44:33Z
branch: codex/story-0390-child-restrictions-failure-path
intended test plan:
- Add a focused failure-path regression for child restrictions and dependency failure handling.
- Run the new targeted test first.
- Run `npm --prefix frontend run test:unit`.
- Run `npm --prefix frontend run typecheck`.
files expected to change:
- frontend/src/services/mealPlanGenerator.ts
- frontend/src/utils/householdChildRestrictions.ts
- frontend/src/tests/unit/household-planning.child-restrictions.failure-path.test.ts
outcome: done
verification:
- `npm exec -- tsx --test src/tests/unit/household-planning.child-restrictions.failure-path.test.ts`
- `npm exec -- tsx --test src/tests/unit/household-planning.child-restrictions.contract-coverage.test.ts`
- `npm exec -- tsx --test src/tests/unit/meal-planning-ux.meal-replacement.operator-feedback.test.ts`
- `npm run test:unit` (failed on unrelated `src/tests/unit/household-planning.preference-conflicts.failure-path.test.ts`)
- `npm run typecheck`
changed files:
- frontend/src/services/mealPlanGenerator.ts
- frontend/src/tests/unit/household-planning.child-restrictions.failure-path.test.ts
- plans/story-board.jsonl
- plans/story-board.md
follow-up stories added:
- none
