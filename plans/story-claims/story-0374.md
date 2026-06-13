storyId: story-0374
title: Preference conflicts: contract coverage
owner: fine-dining-monitor
claimedAt: 2026-06-13T14:54:23Z
branch: codex/story-0374-preference-conflicts-contract-coverage
intendedTestPlan:
  - `npm --prefix frontend exec -- tsx --test src/tests/unit/household-planning.preference-conflicts.contract-coverage.test.ts`
  - `npm --prefix frontend run test:unit`
  - `npm --prefix frontend run typecheck`
filesExpectedToChange:
  - `frontend/src/models/Household/householdSchema.ts`
  - `frontend/src/tests/unit/household-planning.preference-conflicts.contract-coverage.test.ts`
  - `frontend/src/utils/householdPlanningPreferences.ts`
  - `plans/story-board.jsonl`
outcome: done
completedAt: 2026-06-13T14:58:15Z
verification:
  - `npm --prefix frontend exec -- tsx --test frontend/src/tests/unit/household-planning.preference-conflicts.contract-coverage.test.ts`
  - `npm --prefix frontend run test:unit`
  - `npm --prefix frontend run typecheck`
changedFiles:
  - `frontend/src/models/Household/householdSchema.ts`
  - `frontend/src/tests/unit/household-planning.preference-conflicts.contract-coverage.test.ts`
  - `frontend/src/utils/householdPlanningPreferences.ts`
  - `plans/story-board.jsonl`
  - `plans/story-board.md`
followUpStoriesAdded: []
