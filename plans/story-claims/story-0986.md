story id: story-0986
title: Domain cleanup: contract coverage
owner: fine-dining-monitor
claimedAt: 2026-06-13T21:53:33Z
branch: codex/story-0986-domain-cleanup-contract-coverage
model: GPT-5
intended test plan:
- Add a focused ASVAB cleanup contract test covering legacy metadata normalization and malformed payload rejection.
- Run `NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npm exec -- tsx --test src/tests/unit/qa-domain.domain-cleanup.contract-coverage.test.mjs`
- Run `npm --prefix frontend run test:unit`
- Run `npm --prefix frontend run typecheck`
files expected to change:
- frontend/scripts/seed-asvab.mjs
- frontend/src/tests/unit/qa-domain.domain-cleanup.contract-coverage.test.mjs
- plans/story-board.jsonl
- plans/story-board.md

## Completion

outcome: done
completedAt: 2026-06-13T21:57:39Z
verification:
- `NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npm exec -- tsx --test src/tests/unit/qa-domain.domain-cleanup.contract-coverage.test.mjs`
- `NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npm exec -- tsx --test src/tests/unit/asvabSeed.test.mjs src/tests/unit/asvabSeedFromJson.test.mjs src/tests/unit/qa-domain.domain-cleanup.contract-coverage.test.mjs src/tests/unit/qa-domain.quality-qa-dashboard.failure-path.test.mjs`
- `npm --prefix frontend run typecheck`
- `npm test` (fails on pre-existing `frontend/src/tests/unit/household-planning.preference-conflicts.failure-path.test.ts`)
- `npm run lint` (fails on pre-existing duplicate-import lint errors in `frontend/src/graphql/resolvers/mutations/householdMutations.ts`, `frontend/src/tests/unit/cookbook-library.collection-import.scale-boundary.test.ts`, and `frontend/src/tests/unit/cookbook-library.saved-recipe-state.contract-coverage.test.ts`)
- `npm exec -- eslint scripts/seed-asvab.mjs src/tests/unit/qa-domain.domain-cleanup.contract-coverage.test.mjs`
changedFiles:
- frontend/scripts/seed-asvab.mjs
- frontend/src/tests/unit/qa-domain.domain-cleanup.contract-coverage.test.mjs
- plans/story-board.jsonl
- plans/story-board.md
follow-up stories added: none
known remaining blockers:
- `npm test` still fails on pre-existing `frontend/src/tests/unit/household-planning.preference-conflicts.failure-path.test.ts`
- `npm run lint` still fails on pre-existing duplicate-import lint errors in unrelated files
