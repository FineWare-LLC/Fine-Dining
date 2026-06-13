# story-0354

- Title: Recipe versioning: failure path
- Owner: fine-dining-monitor
- ClaimedAt: 2026-06-13T08:01:11Z
- Branch: codex/story-0354-recipe-versioning-failure-path-r2
- Model: GPT-5
- Reasoning: high
- Intended test plan: add `frontend/src/tests/unit/cookbook-library.recipe-versioning.failure-path.test.ts`, then run `npm --prefix frontend run test:unit` and `npm --prefix frontend run typecheck`
- Files expected to change: `frontend/src/graphql/resolvers/mutations/cookbookMutations.ts`, `frontend/src/tests/unit/cookbook-library.recipe-versioning.failure-path.test.ts`, `plans/story-board.jsonl`
- Outcome: done
- Verification: targeted failure-path test, adjacent cookbook failure-path tests, `npm --prefix frontend run test:unit`, `npm --prefix frontend run typecheck`
- Changed files: `frontend/src/graphql/resolvers/mutations/cookbookMutations.ts`, `frontend/src/tests/unit/cookbook-library.recipe-versioning.failure-path.test.ts`, `plans/story-board.jsonl`, `plans/story-board.md`
- Follow-up stories added: none
