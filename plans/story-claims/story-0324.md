story id: story-0324
title: Saved recipe state: failure path
owner: fine-dining-monitor
claimedAt: 2026-06-12T16:59:47Z
branch: codex/story-0324-saved-recipe-state-failure-path
intended test plan: Add a failing unit regression for cookbook failure state at frontend/src/tests/unit/cookbook-library.saved-recipe-state.failure-path.test.ts, then run npm --prefix frontend run test:unit and npm --prefix frontend run typecheck.
files expected to change: frontend/src/pages/cookbook.tsx, frontend/src/pages/recipes.tsx, frontend/src/tests/unit/cookbook-library.saved-recipe-state.failure-path.test.ts, frontend/src/utils/cookbookFeedback.ts, plans/story-board.jsonl, plans/story-board.md
outcome: done
verification: targeted failure-path test, npm --prefix frontend run test:unit, npm --prefix frontend run typecheck
changed files: frontend/src/pages/cookbook.tsx, frontend/src/pages/recipes.tsx, frontend/src/tests/unit/cookbook-library.saved-recipe-state.failure-path.test.ts, frontend/src/utils/cookbookFeedback.ts, plans/story-board.jsonl, plans/story-board.md
follow-up stories added: none
