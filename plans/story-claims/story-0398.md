story-id: story-0398
title: Plan approval: scale boundary
owner: fine-dining-monitor
claimedAt: 2026-06-13T19:04:34Z
branch: codex/story-0398-plan-approval-scale-boundary
intended-test-plan:
  - Targeted scale-boundary regression: `cd frontend && NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs tsx --test src/tests/unit/household-planning.plan-approval.scale-boundary.test.ts`
  - Nearby regressions: `cd frontend && NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs tsx --test src/tests/unit/household-planning.plan-approval.contract-coverage.test.ts src/tests/unit/household-planning.plan-approval.persistence-consistency.test.ts src/tests/unit/household-planning.plan-approval.failure-path.test.ts src/tests/unit/household-planning.plan-approval.operator-feedback.test.ts`
  - `npm --prefix frontend run typecheck`
  - `npm --prefix frontend run test:unit`
files-expected-to-change:
  - frontend/src/graphql/resolvers/mutations/householdMutations.ts
  - frontend/src/tests/unit/household-planning.plan-approval.scale-boundary.test.ts
  - plans/story-board.jsonl
  - plans/story-board.md
outcome: done
verification-commands:
  - `NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs ./node_modules/.bin/tsx --test src/tests/unit/household-planning.plan-approval.scale-boundary.test.ts`
  - `NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs ./node_modules/.bin/tsx --test src/tests/unit/household-planning.plan-approval.contract-coverage.test.ts src/tests/unit/household-planning.plan-approval.failure-path.test.ts src/tests/unit/household-planning.plan-approval.persistence-consistency.test.ts src/tests/unit/household-planning.plan-approval.operator-feedback.test.ts src/tests/unit/household-planning.plan-approval.scale-boundary.test.ts`
  - `npm --prefix frontend run typecheck`
  - `npm --prefix frontend run test:unit` (fails on pre-existing `frontend/src/tests/unit/household-planning.preference-conflicts.failure-path.test.ts`)
changed-files:
  - frontend/src/graphql/resolvers/mutations/householdMutations.ts
  - frontend/src/tests/unit/household-planning.plan-approval.scale-boundary.test.ts
  - plans/story-board.jsonl
  - plans/story-board.md
follow-up-stories-added: []
known-remaining-blockers:
  - `npm --prefix frontend run test:unit` still fails on the unrelated preference-conflicts failure-path test.
