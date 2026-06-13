story id: story-0386
title: Per-member servings: persistence consistency
owner: fine-dining-monitor
claimedAt: 2026-06-13T16:55:24Z
branch: codex/story-0386-per-member-servings-persistence-consistency
intended test plan: Add a focused persistence-consistency unit test for household serving headcount, then run `npm --prefix frontend run test:unit` and `npm --prefix frontend run typecheck`.
files expected to change: frontend/src/models/Household/householdSchema.ts, frontend/src/tests/unit/household-planning.per-member-servings.persistence-consistency.test.ts, plans/story-board.jsonl, plans/story-board.md
outcome: done
verification: focused persistence test passed; related household tests passed; npm --prefix frontend run test:unit failed on pre-existing household-planning.preference-conflicts.failure-path.test.ts; npm --prefix frontend run typecheck passed
changed files: frontend/src/models/Household/householdSchema.ts, frontend/src/tests/unit/household-planning.per-member-servings.persistence-consistency.test.ts, plans/story-board.jsonl, plans/story-board.md
follow-up stories added: none
