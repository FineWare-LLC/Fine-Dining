# Fine Dining Story Claim

storyId: story-0339
title: Recipe search: failure path
owner: fine-dining-monitor
claimedAt: 2026-06-13T00:30:58Z
branch: codex/story-0339-recipe-search-failure-path

intendedTestPlan:
- Add a focused unit regression test for recipe search dependency failure.
- Run `npm --prefix frontend exec -- tsx --test src/tests/unit/cookbook-library.recipe-search.failure-path.test.ts`
- Run `npm --prefix frontend run test:unit`
- Run `npm --prefix frontend run typecheck`

filesExpectedToChange:
- frontend/src/graphql/resolvers/queries/dietaryQueries.ts
- frontend/src/tests/unit/cookbook-library.recipe-search.failure-path.test.ts
- plans/story-board.jsonl
- plans/story-board.md

outcome: done

verification:
- `NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npm exec -- tsx --test src/tests/unit/cookbook-library.recipe-search.failure-path.test.ts`
- `npm --prefix frontend run test:unit`
- `npm --prefix frontend run typecheck`

changedFiles:
- frontend/src/graphql/resolvers/queries/dietaryQueries.ts
- frontend/src/tests/unit/cookbook-library.recipe-search.failure-path.test.ts
- plans/story-board.jsonl
- plans/story-board.md

followUpStoriesAdded: none
