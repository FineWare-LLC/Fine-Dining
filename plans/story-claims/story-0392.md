story id: story-0392
title: Child restrictions: operator feedback
owner: fine-dining-monitor
claimedAt: 2026-06-13T18:03:59Z
branch: codex/story-0392-child-restrictions-operator-feedback
intended test plan:
- Add a focused operator-feedback regression test for child restrictions and accessible states.
- Run the new targeted test first.
- Run `npm --prefix frontend run test:unit`.
- Run `npm --prefix frontend run typecheck`.
files expected to change:
- frontend/src/tests/unit/household-planning.child-restrictions.operator-feedback.test.ts
- frontend/src/utils/householdChildRestrictionsFeedback.ts
- plans/story-board.jsonl
- plans/story-board.md
outcome: done
verification:
- `NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npx tsx --test src/tests/unit/household-planning.child-restrictions.contract-coverage.test.ts src/tests/unit/household-planning.child-restrictions.failure-path.test.ts src/tests/unit/household-planning.child-restrictions.persistence-consistency.test.ts src/tests/unit/household-planning.child-restrictions.operator-feedback.test.ts`
- `npm --prefix frontend run test:unit` (one unrelated failure in `household-planning.preference-conflicts.failure-path.test.ts`)
- `npm --prefix frontend run typecheck`
changed files:
- frontend/src/tests/unit/household-planning.child-restrictions.operator-feedback.test.ts
- frontend/src/utils/householdChildRestrictionsFeedback.ts
- plans/story-board.jsonl
- plans/story-board.md
follow-up stories added: none
