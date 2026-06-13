story id: story-0359
title: Personal notes: failure path
owner: fine-dining-monitor
claimedAt: 2026-06-13T10:58:57Z
branch: codex/story-0359-personal-notes-failure-path
model: GPT-5
reasoningEffort: medium
intended test plan: npm --prefix frontend run test:unit; npm --prefix frontend run typecheck
files expected to change:
  - frontend/src/graphql/resolvers/mutations/cookbookMutations.ts
  - frontend/src/tests/unit/cookbook-library.personal-notes.failure-path.test.ts
  - plans/story-board.jsonl
  - plans/story-board.md
outcome: done
completedAt: 2026-06-13T11:01:56Z
verification:
  - NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npx tsx --test src/tests/unit/cookbook-library.personal-notes.failure-path.test.ts
  - npm --prefix frontend run test:unit
  - npm --prefix frontend run typecheck
changed files:
  - frontend/src/graphql/resolvers/mutations/cookbookMutations.ts
  - frontend/src/tests/unit/cookbook-library.personal-notes.failure-path.test.ts
  - plans/story-board.jsonl
  - plans/story-board.md
follow-up stories added: none
notes: Personal notes now roll back failed post-save hydration before surfacing a recoverable cookbook import persistence error.
