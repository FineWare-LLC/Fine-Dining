story id: story-0358
title: Personal notes: contract coverage
owner: fine-dining-monitor
claimedAt: 2026-06-13T10:27:25Z
branch: codex/story-0358-personal-notes-contract-coverage
intended test plan: NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npx tsx --test src/tests/unit/cookbook-library.personal-notes.contract-coverage.test.ts; npm --prefix frontend run test:unit; npm --prefix frontend run typecheck
files expected to change: frontend/src/pages/recipes.tsx; frontend/src/models/Cookbook/cookbookSchema.ts; frontend/src/tests/unit/cookbook-library.personal-notes.contract-coverage.test.ts; plans/story-board.jsonl
outcome: done
completedAt: 2026-06-13T10:30:55Z
verification:
  - NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npx tsx --test src/tests/unit/cookbook-library.personal-notes.contract-coverage.test.ts
  - npm --prefix frontend run test:unit
  - npm --prefix frontend run typecheck
changed files:
  - frontend/src/models/Cookbook/cookbookSchema.ts
  - frontend/src/tests/unit/cookbook-library.personal-notes.contract-coverage.test.ts
  - plans/story-board.jsonl
  - plans/story-board.md
follow-up stories added: none
notes: Oversized cookbook notes now fail fast before persistence and the valid path keeps trimmed notes canonical.
