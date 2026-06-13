story id: story-0397
title: Plan approval: operator feedback
owner: fine-dining-monitor
claimedAt: 2026-06-13T18:53:22Z
branch: codex/story-0397-plan-approval-operator-feedback
model: GPT-5
reasoningEffort: medium
intendedTestPlan:
- Add a focused operator-feedback regression test for plan approval.
- Run the targeted unit test first.
- Run `npm --prefix frontend run test:unit`.
- Run `npm --prefix frontend run typecheck`.
filesExpectedToChange:
- frontend/src/utils/householdPlanApprovalFeedback.ts
- frontend/src/tests/unit/household-planning.plan-approval.operator-feedback.test.ts
- plans/story-board.jsonl
- plans/story-board.md
- plans/story-claims/story-0397.md

## Completion

- outcome: done
- completedAt: 2026-06-13T18:56:59Z
- verification:
  - `NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npm exec -- tsx --test src/tests/unit/household-planning.plan-approval.operator-feedback.test.ts`
  - `NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npm exec -- tsx --test src/tests/unit/household-planning.plan-approval.contract-coverage.test.ts src/tests/unit/household-planning.plan-approval.failure-path.test.ts src/tests/unit/household-planning.plan-approval.persistence-consistency.test.ts src/tests/unit/household-planning.plan-approval.operator-feedback.test.ts`
  - `npm run typecheck`
  - `npm run test:unit` failed on pre-existing `frontend/src/tests/unit/household-planning.preference-conflicts.failure-path.test.ts`
- changedFiles:
  - `frontend/src/utils/householdPlanApprovalFeedback.ts`
  - `frontend/src/tests/unit/household-planning.plan-approval.operator-feedback.test.ts`
  - `plans/story-board.jsonl`
  - `plans/story-board.md`
  - `plans/story-claims/story-0397.md`
- followUpStoriesAdded: none
