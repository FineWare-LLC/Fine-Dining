story_id: story-0364
title: Private collections: failure path
owner: fine-dining-monitor
claimedAt: 2026-06-13T12:58:51Z
branch: codex/story-0364-private-collections-failure-path
model: GPT-5
reasoningEffort: standard
intended_test_plan:
  - Add a regression test for private cookbook creation save failures.
  - Run `NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npx tsx --test src/tests/unit/cookbook-library.private-collections.failure-path.test.ts`.
  - Run `npm --prefix frontend run test:unit` and `npm --prefix frontend run typecheck`.
files_expected_to_change:
  - frontend/src/graphql/resolvers/mutations/cookbookMutations.ts
  - frontend/src/tests/unit/cookbook-library.private-collections.failure-path.test.ts
  - plans/story-board.jsonl
  - plans/story-board.md
outcome: done
verification:
  - NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs ./node_modules/.bin/tsx --test src/tests/unit/cookbook-library.private-collections.failure-path.test.ts
  - NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs ./node_modules/.bin/tsx --test src/tests/unit/cookbook-library.private-collections.contract-coverage.test.ts
  - NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs ./node_modules/.bin/tsx --test src/tests/unit/cookbook-library.cookbook-sharing.failure-path.test.ts
  - npm --prefix frontend run test:unit
  - npm --prefix frontend run typecheck
changed_files:
  - frontend/src/graphql/resolvers/mutations/cookbookMutations.ts
  - frontend/src/tests/unit/cookbook-library.private-collections.failure-path.test.ts
  - plans/story-board.jsonl
  - plans/story-board.md
follow_up_stories_added: []
