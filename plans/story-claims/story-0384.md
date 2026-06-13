story-id: story-0384
title: Per-member servings: contract coverage
owner: fine-dining-monitor
claimedAt: 2026-06-13T16:33:44Z
branch: codex/story-0384-per-member-servings-contract-coverage
model: GPT-5
reasoning-effort: high
completedAt: 2026-06-13T16:38:25Z
outcome: done
intended-test-plan:
  - Add a failing contract-coverage regression test for per-member serving inputs on household members.
  - Run the targeted unit test, then `npm --prefix frontend run test:unit` and `npm --prefix frontend run typecheck`.
verification:
  - NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs ./node_modules/.bin/tsx --test src/tests/unit/household-planning.per-member-servings.contract-coverage.test.ts
  - npm --prefix frontend run typecheck
  - npm --prefix frontend run test:unit (fails on pre-existing frontend/src/tests/unit/household-planning.preference-conflicts.failure-path.test.ts because updateHousehold omits expectedUpdatedAt)
files-expected-to-change:
  - frontend/src/tests/unit/household-planning.per-member-servings.contract-coverage.test.ts
  - frontend/src/graphql/resolvers/mutations/householdMutations.ts
  - frontend/src/utils/householdMemberServings.ts
  - plans/story-board.jsonl
  - plans/story-board.md
changed-files:
  - frontend/src/tests/unit/household-planning.per-member-servings.contract-coverage.test.ts
  - frontend/src/graphql/resolvers/mutations/householdMutations.ts
  - frontend/src/utils/householdMemberServings.ts
  - plans/story-board.jsonl
  - plans/story-board.md
follow-up-stories-added: []
