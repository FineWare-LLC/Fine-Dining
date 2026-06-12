story id: story-0334
title: Tag management: failure path
owner: fine-dining-monitor
claimedAt: 2026-06-12T21:58:21Z
branch: codex/story-0334-tag-management-failure-path
model: GPT-5
reasoningEffort: medium
intended test plan: npm --prefix frontend run test:unit -- cookbook-library.tag-management.failure-path.test.ts; npm --prefix frontend run typecheck
completedAt: 2026-06-12T22:01:40Z
files expected to change:
- frontend/src/graphql/resolvers/mutations/recipeMutations.ts
- frontend/src/tests/unit/cookbook-library.tag-management.failure-path.test.ts
- frontend/src/models/Recipe/index.ts
- plans/story-board.jsonl
- plans/story-board.md
outcome: done
verification:
- NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npx tsx --test src/tests/unit/cookbook-library.tag-management.failure-path.test.ts
- NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npx tsx --test src/tests/unit/cookbook-library.tag-management.contract-coverage.test.ts
- npm --prefix frontend run test:unit
- npm --prefix frontend run typecheck
changed files:
- frontend/src/graphql/resolvers/mutations/recipeMutations.ts
- frontend/src/models/Recipe/index.ts
- frontend/src/tests/unit/cookbook-library.tag-management.failure-path.test.ts
- plans/story-board.jsonl
- plans/story-board.md
follow-up stories: none
