story-id: story-0385
title: Per-member servings: failure path
owner: fine-dining-monitor
claimedAt: 2026-06-13T16:43:01Z
branch: codex/story-0385-per-member-servings-failure-path
model: GPT-5
reasoning-effort: high
intended-test-plan:
  - Add a failing failure-path regression test for addHouseholdMember when user linkage fails after a valid serving multiplier.
  - Run the targeted unit test, then `npm --prefix frontend run test:unit` and `npm --prefix frontend run typecheck`.
files-expected-to-change:
  - frontend/src/tests/unit/household-planning.per-member-servings.failure-path.test.ts
  - frontend/src/graphql/resolvers/mutations/householdMutations.ts
  - plans/story-board.jsonl
completedAt: 2026-06-13T16:46:24Z
outcome: done
verification:
  - NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs ./node_modules/.bin/tsx --test src/tests/unit/household-planning.per-member-servings.failure-path.test.ts
  - npm --prefix frontend run test:unit (failed on pre-existing frontend/src/tests/unit/household-planning.preference-conflicts.failure-path.test.ts)
  - npm --prefix frontend run typecheck
changed-files:
  - frontend/src/tests/unit/household-planning.per-member-servings.failure-path.test.ts
  - frontend/src/graphql/resolvers/mutations/householdMutations.ts
  - plans/story-board.jsonl
  - plans/story-board.md
follow-up-stories-added: []
