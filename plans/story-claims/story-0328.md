story id: story-0328
title: Cookbook sharing: contract coverage
owner: fine-dining-monitor
claimedAt: 2026-06-12T19:00:07Z
branch: codex/story-0328-cookbook-sharing-contract-coverage
intended test plan: npm --prefix frontend run test:unit && npm --prefix frontend run typecheck
files expected to change:
- frontend/src/utils/cookbookFeedback.ts
- frontend/src/pages/recipes.tsx
- frontend/src/tests/unit/cookbook-library.cookbook-sharing.contract-coverage.test.ts
- frontend/src/tests/unit/cookbook-library.saved-recipe-state.operator-feedback.test.ts
outcome: done
verification:
- NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs ./node_modules/.bin/tsx --test src/tests/unit/cookbook-library.cookbook-sharing.contract-coverage.test.ts
- NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs ./node_modules/.bin/tsx --test src/tests/unit/cookbook-library.cookbook-sharing.contract-coverage.test.ts src/tests/unit/cookbook-library.saved-recipe-state.operator-feedback.test.ts src/tests/unit/cookbook-library.saved-recipe-state.failure-path.test.ts src/tests/unit/cookbook-library.saved-recipe-state.persistence-consistency.test.ts
- npm --prefix frontend run test:unit
- npm --prefix frontend run typecheck
changed files:
- frontend/src/utils/cookbookFeedback.ts
- frontend/src/pages/recipes.tsx
- frontend/src/tests/unit/cookbook-library.cookbook-sharing.contract-coverage.test.ts
- frontend/src/tests/unit/cookbook-library.saved-recipe-state.operator-feedback.test.ts
- plans/story-board.jsonl
- plans/story-board.md
follow-up stories added: none
run completed at: 2026-06-12T19:02:53Z
