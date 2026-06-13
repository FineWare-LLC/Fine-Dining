# story-0376

- story id: story-0376
- title: Preference conflicts: persistence consistency
- owner: fine-dining-monitor
- claimedAt: 2026-06-13T15:14:17Z
- branch: codex/story-0376-preference-conflicts-persistence-consistency
- intendedTestPlan: add `frontend/src/tests/unit/household-planning.preference-conflicts.persistence-consistency.test.ts`, run `NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npx tsx --test src/tests/unit/household-planning.preference-conflicts.persistence-consistency.test.ts`, then `npm --prefix frontend run test:unit` and `npm --prefix frontend run typecheck`
- filesExpectedToChange:
  - frontend/src/utils/householdPlanningPreferences.ts
  - frontend/src/tests/unit/household-planning.preference-conflicts.persistence-consistency.test.ts
  - plans/story-board.jsonl
  - plans/story-board.md

## Outcome

- status: done
- completedAt: 2026-06-13T15:16:42Z
- summary: Planning defaults now clone `mealSlots` before validation returns, so refresh snapshots stay stable if the source payload mutates.

## Verification

- NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npx tsx --test src/tests/unit/household-planning.preference-conflicts.persistence-consistency.test.ts
- NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npx tsx --test src/tests/unit/household-planning.preference-conflicts.contract-coverage.test.ts src/tests/unit/household-planning.preference-conflicts.failure-path.test.ts src/tests/unit/household-planning.preference-conflicts.persistence-consistency.test.ts
- npm --prefix frontend run test:unit
- npm --prefix frontend run typecheck

## Changed Files

- frontend/src/utils/householdPlanningPreferences.ts
- frontend/src/tests/unit/household-planning.preference-conflicts.persistence-consistency.test.ts
- plans/story-board.jsonl
- plans/story-board.md

## Follow-Up

- none
