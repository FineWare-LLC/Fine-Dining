story id: story-0336
title: Tag management: operator feedback
owner: fine-dining-monitor
claimedAt: 2026-06-12T23:02:15Z
branch: codex/story-0336-tag-management-operator-feedback
intended test plan: npm --prefix frontend exec tsx --test src/tests/unit/cookbook-library.tag-management.operator-feedback.test.ts; npm --prefix frontend run test:unit; npm --prefix frontend run typecheck
files expected to change:
- frontend/src/pages/recipes.tsx
- frontend/src/utils/recipeSearchFeedback.ts
- frontend/src/tests/unit/cookbook-library.tag-management.operator-feedback.test.ts
- plans/story-board.jsonl
- plans/story-board.md
outcome: done
completedAt: 2026-06-12T23:07:32Z
verification:
- NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npx tsx --test src/tests/unit/cookbook-library.tag-management.operator-feedback.test.ts
- npm --prefix frontend run test:unit
- npm --prefix frontend run typecheck
changed files:
- frontend/src/pages/recipes.tsx
- frontend/src/utils/recipeSearchFeedback.ts
- frontend/src/tests/unit/cookbook-library.tag-management.operator-feedback.test.ts
- plans/story-board.jsonl
- plans/story-board.md
- plans/story-claims/story-0336.md
follow-up stories: none
