story id: story-0387
title: Per-member servings: operator feedback
owner: fine-dining-monitor
claimedAt: 2026-06-13T17:03:13Z
branch: codex/story-0387-per-member-servings-operator-feedback
intended test plan: Add a focused operator-feedback unit test for per-member servings, then run `npm --prefix frontend run test:unit` and `npm --prefix frontend run typecheck`.
files expected to change: frontend/src/utils/householdMemberServingsFeedback.ts, frontend/src/tests/unit/household-planning.per-member-servings.operator-feedback.test.ts, plans/story-board.jsonl
completedAt: 2026-06-13T17:07:07Z
outcome: done
verification: targeted operator-feedback test passed; per-member-servings regression set passed; frontend typecheck passed; frontend test:unit failed on pre-existing household-planning.preference-conflicts.failure-path.test.ts
changed files: frontend/src/utils/householdMemberServingsFeedback.ts, frontend/src/tests/unit/household-planning.per-member-servings.operator-feedback.test.ts, plans/story-board.jsonl, plans/story-board.md
follow-up stories added: none
