story id: story-0363
title: Private collections: contract coverage
owner: fine-dining-monitor
claimedAt: 2026-06-13T10:00:43Z
branch: codex/story-0363-private-collections-contract-coverage
model: GPT-5
reasoningEffort: medium
intendedTestPlan:
  - NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npx tsx --test src/tests/unit/cookbook-library.private-collections.contract-coverage.test.ts
  - npm --prefix frontend run test:unit
  - npm --prefix frontend run typecheck
filesExpectedToChange:
  - frontend/src/models/Cookbook/cookbookSchema.ts
  - frontend/src/graphql/resolvers/mutations/cookbookMutations.ts
  - frontend/src/tests/unit/cookbook-library.private-collections.contract-coverage.test.ts
  - plans/story-board.jsonl
outcome: done
verification:
  - NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npx tsx --test src/tests/unit/cookbook-library.private-collections.contract-coverage.test.ts
  - npm --prefix frontend run test:unit
  - npm --prefix frontend run typecheck
changedFiles:
  - frontend/src/graphql/resolvers/mutations/cookbookMutations.ts
  - frontend/src/tests/unit/cookbook-library.private-collections.contract-coverage.test.ts
  - plans/story-board.jsonl
  - plans/story-board.md
followUpStories: []
summary: Private cookbook visibility now defaults to private and rejects malformed visibility payloads before persistence.
