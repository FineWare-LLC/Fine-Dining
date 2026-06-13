story id: story-0360
title: Personal notes: persistence consistency
owner: fine-dining-monitor
claimedAt: 2026-06-13T11:29:56Z
branch: codex/story-0360-personal-notes-persistence
model: GPT-5
reasoningEffort: medium
intended test plan: npm --prefix frontend run test:unit; npm --prefix frontend run typecheck
files expected to change:
  - frontend/src/pages/cookbook.tsx
  - frontend/src/pages/recipes.tsx
  - frontend/src/tests/unit/cookbook-library.personal-notes.persistence-consistency.test.ts
  - plans/story-board.jsonl
  - plans/story-board.md
outcome: done
completedAt: 2026-06-13T11:32:23Z
verification:
  - NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npx tsx --test src/tests/unit/cookbook-library.personal-notes.persistence-consistency.test.ts
  - npm --prefix frontend run test:unit
  - npm --prefix frontend run typecheck
changed files:
  - frontend/src/pages/cookbook.tsx
  - frontend/src/pages/recipes.tsx
  - frontend/src/tests/unit/cookbook-library.personal-notes.persistence-consistency.test.ts
  - plans/story-board.jsonl
  - plans/story-board.md
follow-up stories added: none
notes: Personal notes now render on cookbook cards and stay included in the browse-page cookbook query across refresh.
