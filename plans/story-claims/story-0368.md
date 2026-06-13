# story-0368
- title: Library performance: contract coverage
- owner: fine-dining-monitor
- claimedAt: 2026-06-13T13:54:11Z
- branch: codex/story-0368-library-performance-contract-coverage
- intended test plan:
  - `npm --prefix frontend run test:unit`
  - `npm --prefix frontend run typecheck`
- files expected to change:
  - `frontend/src/graphql/resolvers/queries/recipeQueries.ts`
  - `frontend/src/tests/unit/cookbook-library.library-performance.contract-coverage.test.ts`
- note: validate recipe pagination uses a query object and stable ordering for the admin recipe list boundary.

## Outcome
- status: done
- verification:
  - `NODE_OPTIONS=--import=/Users/tt/IdeaProjects/Fine-Dining/frontend/src/utils/serverOptimizerAliasRegister.mjs npm exec -- tsx --test src/tests/unit/cookbook-library.library-performance.contract-coverage.test.ts`
  - `npm --prefix frontend run test:unit`
  - `npm --prefix frontend run typecheck`
- changed files:
  - `frontend/src/graphql/resolvers/queries/recipeQueries.ts`
  - `frontend/src/tests/unit/cookbook-library.library-performance.contract-coverage.test.ts`
  - `plans/story-board.jsonl`
  - `plans/story-board.md`
- follow-up stories added: none
