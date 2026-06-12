story id: story-0329
title: Cookbook sharing: failure path
owner: fine-dining-monitor
claimedAt: 2026-06-12T19:29:38Z
branch: codex/story-0329-cookbook-sharing-failure-path
intended test plan: npm --prefix frontend exec tsx --test src/tests/unit/cookbook-library.cookbook-sharing.failure-path.test.ts
files expected to change:
- frontend/src/graphql/resolvers/mutations/cookbookMutations.ts
- frontend/src/tests/unit/cookbook-library.cookbook-sharing.failure-path.test.ts
- plans/story-board.jsonl
- plans/story-claims/story-0329.md
outcome: done
completedAt: 2026-06-12T19:32:17Z
verification:
- NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs ./node_modules/.bin/tsx --test src/tests/unit/cookbook-library.cookbook-sharing.failure-path.test.ts
- npm --prefix frontend run test:unit
- npm --prefix frontend run typecheck
changed files:
- frontend/src/graphql/resolvers/mutations/cookbookMutations.ts
- frontend/src/tests/unit/cookbook-library.cookbook-sharing.failure-path.test.ts
- plans/story-board.jsonl
- plans/story-board.md
follow-up stories: none
