story id: story-0338
title: Recipe search: contract coverage
owner: fine-dining-monitor
claimedAt: 2026-06-12T23:59:31Z
branch: codex/story-0338-recipe-search-contract-coverage
intended test plan: targeted Node contract test, then frontend unit suite and typecheck
files expected to change:
- frontend/src/tests/unit/cookbook-library.recipe-search.contract-coverage.test.ts
- frontend/src/graphql/resolvers/queries/recipeQueries.ts
- frontend/src/utils/recipeSearch.ts
- plans/story-board.jsonl
- plans/story-board.md
outcome: done
completedAt: 2026-06-13T00:06:32Z
verification:
- NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs ./node_modules/.bin/tsx --test src/tests/unit/cookbook-library.recipe-search.contract-coverage.test.ts
- npm --prefix frontend run test:unit
- npm --prefix frontend run typecheck
changed files:
- frontend/src/tests/unit/cookbook-library.recipe-search.contract-coverage.test.ts
- frontend/src/utils/recipeSearch.ts
- frontend/src/graphql/resolvers/queries/recipeQueries.ts
- plans/story-board.jsonl
- plans/story-board.md
follow-up stories added: none
run completed at: 2026-06-13T00:06:32Z
