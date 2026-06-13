story id: story-0403
title: Shopping ownership: scale boundary
owner: fine-dining-monitor
claimedAt: 2026-06-13T20:03:43Z
branch: codex/story-0403-shopping-ownership-scale-boundary
model: GPT-5
intended test plan:
- `NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npm exec -- tsx --test src/tests/unit/household-planning.shopping-ownership.scale-boundary.test.ts`
- `npm --prefix frontend run typecheck`
- `npm --prefix frontend run test:unit`
completedAt: 2026-06-13T20:06:08Z
outcome: done
files expected to change:
- frontend/src/graphql/resolvers/mutations/householdMutations.ts
- frontend/src/tests/unit/household-planning.shopping-ownership.scale-boundary.test.ts
- plans/story-board.jsonl
- plans/story-board.md
- plans/story-claims/story-0403.md

verification:
- `NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npm exec -- tsx --test src/tests/unit/household-planning.shopping-ownership.scale-boundary.test.ts` passed.
- `NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npm exec -- tsx --test src/tests/unit/household-planning.shopping-ownership.contract-coverage.test.ts src/tests/unit/household-planning.shopping-ownership.failure-path.test.ts src/tests/unit/household-planning.shopping-ownership.persistence-consistency.test.ts src/tests/unit/household-planning.shopping-ownership.scale-boundary.test.ts` passed.
- `npm --prefix frontend run typecheck` passed.
- `npm --prefix frontend run test:unit` failed in the pre-existing `frontend/src/tests/unit/household-planning.preference-conflicts.failure-path.test.ts`.

changed files:
- frontend/src/graphql/resolvers/mutations/householdMutations.ts
- frontend/src/tests/unit/household-planning.shopping-ownership.scale-boundary.test.ts
- plans/story-board.jsonl
- plans/story-board.md
- plans/story-claims/story-0403.md

follow-up stories added: none
