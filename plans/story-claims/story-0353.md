# story-0353

- Title: Recipe versioning: contract coverage
- Owner: fine-dining-monitor
- ClaimedAt: 2026-06-13T07:31:43Z
- Branch: codex/story-0353-recipe-versioning-contract
- Intended test plan: add `frontend/src/tests/unit/cookbook-library.recipe-versioning.contract-coverage.test.ts`, then run `npm --prefix frontend run test:unit` and `npm --prefix frontend run typecheck`
- Files expected to change: `frontend/src/models/Cookbook/cookbookSchema.ts`, `frontend/src/utils/cookbookImport.ts`, `frontend/src/pages/recipes.tsx`, `frontend/src/pages/cookbook.tsx`, `frontend/src/graphql/typeDefs.ts`, `frontend/src/tests/unit/cookbook-library.recipe-versioning.contract-coverage.test.ts`

## Outcome

- Status: done
- CompletedAt: 2026-06-13T07:44:43Z
- Summary: recipe versioning now carries optional recipe version metadata from recipe search into cookbook storage and surfaces the saved version in the cookbook UI.

## Verification

- `./node_modules/.bin/tsx --test src/tests/unit/cookbook-library.recipe-versioning.contract-coverage.test.ts`
- `./node_modules/.bin/tsx --test src/tests/unit/cookbook-library.collection-import.contract-coverage.test.ts src/tests/unit/cookbook-library.collection-import.persistence-consistency.test.ts src/tests/unit/cookbook-library.collection-import.failure-path.test.ts src/tests/unit/cookbook-library.saved-recipe-state.contract-coverage.test.ts src/tests/unit/cookbook-library.saved-recipe-state.persistence-consistency.test.ts src/tests/unit/cookbook-library.tag-management.contract-coverage.test.ts src/tests/unit/cookbook-library.recipe-versioning.contract-coverage.test.ts`
- `npm --prefix frontend run typecheck`
- `npm --prefix frontend run test:unit` completed with unrelated ASVAB failures outside this story

## Changed Files

- `frontend/src/utils/cookbookImport.ts`
- `frontend/src/models/Cookbook/cookbookSchema.ts`
- `frontend/src/graphql/resolvers/mutations/cookbookMutations.ts`
- `frontend/src/pages/recipes.tsx`
- `frontend/src/pages/cookbook.tsx`
- `frontend/src/graphql/typeDefs.ts`
- `frontend/src/tests/unit/cookbook-library.recipe-versioning.contract-coverage.test.ts`
- `plans/story-board.jsonl`
- `plans/story-board.md`

## Follow-up Stories Added

- None
