story id: story-0401
title: Shopping ownership: persistence consistency
owner: fine-dining-monitor
claimedAt: 2026-06-13T19:42:52Z
branch: codex/story-0401-shopping-ownership-persistence-consistency
model: GPT-5
reasoning effort: medium
intended test command: npm --prefix frontend run test:unit
files expected to change:
- frontend/src/graphql/resolvers/mutations/householdMutations.ts
- frontend/src/graphql/resolvers/queries/householdQueries.ts
- frontend/src/models/Household/householdSchema.ts
- frontend/src/tests/unit/household-planning.shopping-ownership.persistence-consistency.test.ts
- plans/story-board.jsonl

outcome: done
completedAt: 2026-06-13T19:46:55Z
verification:
- NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs ./node_modules/.bin/tsx --test src/tests/unit/household-planning.shopping-ownership.contract-coverage.test.ts src/tests/unit/household-planning.shopping-ownership.failure-path.test.ts src/tests/unit/household-planning.shopping-ownership.persistence-consistency.test.ts
- npm --prefix frontend run typecheck
- npm --prefix frontend run test:unit (fails on pre-existing frontend/src/tests/unit/household-planning.preference-conflicts.failure-path.test.ts)
changed files:
- frontend/src/graphql/resolvers/mutations/householdMutations.ts
- frontend/src/graphql/resolvers/queries/householdQueries.ts
- frontend/src/models/Household/householdSchema.ts
- frontend/src/utils/householdShoppingOwnership.ts
- frontend/src/tests/unit/household-planning.shopping-ownership.contract-coverage.test.ts
- frontend/src/tests/unit/household-planning.shopping-ownership.persistence-consistency.test.ts
- plans/story-board.jsonl
- plans/story-board.md
- plans/story-claims/story-0401.md
follow-up stories added: none
known remaining blockers: frontend/src/tests/unit/household-planning.preference-conflicts.failure-path.test.ts still fails in the full unit suite
