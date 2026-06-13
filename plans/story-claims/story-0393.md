story id: story-0393
title: Child restrictions: scale boundary
owner: fine-dining-monitor
claimedAt: 2026-06-13T18:24:41Z
branch: codex/story-0393-child-restrictions-scale-boundary
model: GPT-5
reasoningEffort: medium
intendedTestPlan:
- Add a focused scale-boundary regression test for child restrictions meal filtering.
- Run the targeted unit test first.
- Run `npm --prefix frontend run test:unit`.
- Run `npm --prefix frontend run typecheck`.
filesExpectedToChange:
- frontend/src/services/mealPlanGenerator.ts
- frontend/src/utils/substitutionSuggestions.ts
- frontend/src/tests/unit/household-planning.child-restrictions.scale-boundary.test.ts
- plans/story-board.jsonl
outcome: done
verification:
- `npm exec -- tsx --test src/tests/unit/household-planning.child-restrictions.scale-boundary.test.ts`
- `npm exec -- tsx --test src/tests/unit/household-planning.child-restrictions.contract-coverage.test.ts src/tests/unit/household-planning.child-restrictions.failure-path.test.ts src/tests/unit/household-planning.child-restrictions.operator-feedback.test.ts src/tests/unit/household-planning.child-restrictions.persistence-consistency.test.ts src/tests/unit/household-planning.child-restrictions.scale-boundary.test.ts src/tests/unit/grocery-shopping.substitution-suggestions.contract-coverage.test.ts src/tests/unit/onboarding-profile.food-dislike-capture.scale-boundary.test.ts`
- `npm run test:unit` (fails on unrelated `household-planning.preference-conflicts.failure-path.test.ts`)
- `npm run typecheck`
changedFiles:
- frontend/src/services/mealPlanGenerator.ts
- frontend/src/tests/unit/household-planning.child-restrictions.scale-boundary.test.ts
- frontend/src/utils/substitutionSuggestions.ts
- plans/story-board.jsonl
- plans/story-board.md
followUpStoriesAdded: none
