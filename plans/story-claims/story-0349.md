story id: story-0349
title: Collection import: failure path
owner: fine-dining-monitor
claimedAt: 2026-06-13T05:29:00Z
branch: codex/story-0349-collection-import-failure-path
model: GPT-5
reasoning: high
planned tests:
- `node --test frontend/src/tests/unit/cookbook-library.collection-import.failure-path.test.ts`
- `npm --prefix frontend run test:unit`
- `npm --prefix frontend run typecheck`
expected files:
- `frontend/src/graphql/resolvers/mutations/cookbookMutations.ts`
- `frontend/src/tests/unit/cookbook-library.collection-import.failure-path.test.ts`
- `plans/story-board.jsonl`
- `plans/story-board.md`
outcome: done
verification:
- `NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs ./node_modules/.bin/tsx --test src/tests/unit/cookbook-library.collection-import.failure-path.test.ts`
- `npm --prefix frontend run test:unit`
- `npm --prefix frontend run typecheck`
changed files:
- `frontend/src/graphql/resolvers/mutations/cookbookMutations.ts`
- `frontend/src/tests/unit/cookbook-library.collection-import.failure-path.test.ts`
- `plans/story-board.jsonl`
- `plans/story-board.md`
follow-up stories: none
