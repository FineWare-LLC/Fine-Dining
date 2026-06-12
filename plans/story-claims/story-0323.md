# Story Claim

- story id: story-0323
- title: Saved recipe state: contract coverage
- owner: fine-dining-monitor
- model: GPT-5
- reasoning effort: medium
- claimedAt: 2026-06-12T16:29:46Z
- branch: codex/story-0323-saved-recipe-state-contract-coverage
- intended test plan: add a focused contract test for valid and invalid saved-recipe payloads, then run `npm --prefix frontend run test:unit` and `npm --prefix frontend run typecheck`
- files expected to change: `frontend/src/tests/unit/cookbook-library.saved-recipe-state.contract-coverage.test.ts`, `frontend/src/models/Cookbook/cookbookSchema.ts`, `frontend/src/graphql/resolvers/mutations/cookbookMutations.ts`
