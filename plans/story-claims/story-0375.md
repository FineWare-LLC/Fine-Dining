story-id: story-0375
title: Preference conflicts: failure path
owner: fine-dining-monitor
claimedAt: 2026-06-13T15:04:34Z
branch: codex/story-0375-preference-conflicts-failure-path
completedAt: 2026-06-13T15:07:39Z
outcome: done
intended-test-plan: Add a resolver regression test that proves conflicting household planning defaults fail before mutating or saving the household, then run frontend unit and typecheck verification.
verification:
  - NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npx tsx --test src/tests/unit/household-planning.preference-conflicts.failure-path.test.ts
  - NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npx tsx --test src/tests/unit/household-planning.member-invites.scale-boundary.test.ts
  - npm --prefix frontend run test:unit
  - npm --prefix frontend run typecheck
files-expected-to-change:
  - frontend/src/graphql/resolvers/mutations/householdMutations.ts
  - frontend/src/models/Household/householdSchema.ts
  - frontend/src/tests/unit/household-planning.preference-conflicts.failure-path.test.ts
  - plans/story-board.jsonl
  - plans/story-board.md
