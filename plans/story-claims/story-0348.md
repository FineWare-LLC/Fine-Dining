story id: story-0348
title: Collection import: contract coverage
owner: fine-dining-monitor
claimedAt: 2026-06-13T05:01:26Z
branch: codex/story-0348-collection-import-contract-coverage
intended test plan: Add a focused contract test for collection import validation, then run `npm --prefix frontend run test:unit` and `npm --prefix frontend run typecheck`.
files expected to change: frontend/src/models/Cookbook/cookbookSchema.ts, frontend/src/graphql/resolvers/mutations/cookbookMutations.ts, frontend/src/tests/unit/cookbook-library.collection-import.contract-coverage.test.ts, plans/story-board.jsonl, plans/story-board.md
outcome: done
completedAt: 2026-06-13T05:03:55Z
verification:
- npm exec -- tsx --test src/tests/unit/cookbook-library.collection-import.contract-coverage.test.ts
- npm exec -- tsx --test src/tests/unit/cookbook-library.saved-recipe-state.contract-coverage.test.ts src/tests/unit/cookbook-library.saved-recipe-state.persistence-consistency.test.ts
- npm exec -- tsx --test src/tests/unit/cookbook-library.cookbook-sharing.failure-path.test.ts src/tests/unit/cookbook-library.cookbook-sharing.contract-coverage.test.ts
- npm run test:unit
- npm run typecheck
changed files:
- frontend/src/models/Cookbook/cookbookSchema.ts
- frontend/src/graphql/resolvers/mutations/cookbookMutations.ts
- frontend/src/tests/unit/cookbook-library.collection-import.contract-coverage.test.ts
- plans/story-board.jsonl
- plans/story-board.md
follow-up stories added: none
