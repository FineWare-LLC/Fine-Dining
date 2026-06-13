story-id: story-0332
title: Cookbook sharing: scale boundary
owner: fine-dining-monitor
claimedAt: 2026-06-12T20:58:25Z
branch: codex/story-0332-cookbook-sharing-scale-boundary
intended-test-plan:
  - Add a focused cookbook sharing scale-boundary regression test.
  - Run the targeted Node test for that file.
  - Run `npm --prefix frontend run test:unit`.
  - Run `npm --prefix frontend run typecheck`.
files-expected-to-change:
  - frontend/src/tests/unit/cookbook-library.cookbook-sharing.scale-boundary.test.ts
  - frontend/src/utils/cookbookSharing.ts
  - frontend/src/pages/cookbook.tsx
  - frontend/src/pages/recipes.tsx
outcome: done
verification:
  - NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npx tsx --test src/tests/unit/cookbook-library.cookbook-sharing.scale-boundary.test.ts
  - npm --prefix frontend run test:unit
  - npm --prefix frontend run typecheck
changed-files:
  - frontend/src/models/Cookbook/cookbookSchema.ts
  - frontend/src/tests/unit/cookbook-library.cookbook-sharing.scale-boundary.test.ts
  - plans/story-board.jsonl
  - plans/story-board.md
  - plans/story-claims/story-0332.md
follow-up-stories-added: []
