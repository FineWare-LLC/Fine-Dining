story-id: story-0383
title: Shared plan editing: scale boundary
owner: fine-dining-monitor
claimedAt: 2026-06-13T16:23:44Z
branch: codex/story-0383-shared-plan-editing-scale-boundary
model: GPT-5
reasoning-effort: high
completedAt: 2026-06-13T16:27:50Z
outcome: done
intended-test-plan:
  - Add a failing scale-boundary regression test for stale shared-plan updates on a large household fixture.
  - Run the targeted unit test, then `npm --prefix frontend run test:unit` and `npm --prefix frontend run typecheck`.
verification:
  - NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs ./node_modules/.bin/tsx --test src/tests/unit/household-planning.shared-plan-editing.scale-boundary.test.ts
  - npm --prefix frontend run test:unit
  - npm --prefix frontend run typecheck
files-expected-to-change:
  - frontend/src/tests/unit/household-planning.shared-plan-editing.scale-boundary.test.ts
  - frontend/src/graphql/resolvers/mutations/householdMutations.ts
  - plans/story-board.jsonl
  - plans/story-board.md
changed-files:
  - frontend/src/tests/unit/household-planning.shared-plan-editing.scale-boundary.test.ts
  - frontend/src/graphql/resolvers/mutations/householdMutations.ts
  - plans/story-board.jsonl
  - plans/story-board.md
follow-up-stories-added: []
