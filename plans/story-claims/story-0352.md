story-id: story-0352
title: Collection import: scale boundary
owner: fine-dining-monitor
claimedAt: 2026-06-13T07:01:15Z
completedAt: 2026-06-13T07:04:09Z
branch: codex/story-0352-collection-import-scale-boundary
model: GPT-5
reasoning: medium
outcome: done
intendedTestPlan:
  - Add a focused collection import scale-boundary regression test.
  - Run the targeted Node test for that file.
  - Run `npm --prefix frontend run test:unit`.
  - Run `npm --prefix frontend run typecheck`.
verification:
  - `NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npx tsx --test src/tests/unit/cookbook-library.collection-import.scale-boundary.test.ts`
  - `npm --prefix frontend run test:unit`
  - `npm --prefix frontend run typecheck`
files-expected-to-change:
  - frontend/src/models/Cookbook/cookbookSchema.ts
  - frontend/src/graphql/resolvers/mutations/cookbookMutations.ts
  - frontend/src/tests/unit/cookbook-library.collection-import.scale-boundary.test.ts
changedFiles:
  - frontend/src/models/Cookbook/cookbookSchema.ts
  - frontend/src/graphql/resolvers/mutations/cookbookMutations.ts
  - frontend/src/tests/unit/cookbook-library.collection-import.scale-boundary.test.ts
  - plans/story-board.jsonl
  - plans/story-board.md
followUpStories: []
notes: Boundary guard now fails fast before save on a full cookbook.
