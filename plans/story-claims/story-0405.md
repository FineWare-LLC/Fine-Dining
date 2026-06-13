story id: story-0405
title: Notification preferences: failure path
owner: fine-dining-monitor
claimedAt: 2026-06-13T20:13:09Z
branch: codex/story-0405-notification-preferences-failure-path
model: GPT-5
intended test plan:
- `NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npm exec -- tsx --test src/tests/unit/household-planning.notification-preferences.failure-path.test.ts`
- `npm --prefix frontend run typecheck`
- `npm --prefix frontend run test:unit`
files expected to change:
- frontend/src/graphql/resolvers/queries/householdQueries.ts
- frontend/src/tests/unit/household-planning.notification-preferences.failure-path.test.ts
- frontend/src/utils/householdNotificationPreferences.ts
- plans/story-board.jsonl
- plans/story-board.md
completedAt: 2026-06-13T20:20:25Z
outcome: done
verification:
- `NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npm exec -- tsx --test src/tests/unit/household-planning.notification-preferences.contract-coverage.test.ts src/tests/unit/household-planning.notification-preferences.failure-path.test.ts src/tests/unit/household-planning.shopping-ownership.persistence-consistency.test.ts` passed.
- `NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npm exec -- tsx --test src/tests/unit/household-planning.notification-preferences.contract-coverage.test.ts src/tests/unit/household-planning.notification-preferences.failure-path.test.ts src/tests/unit/household-planning.shopping-ownership.scale-boundary.test.ts src/tests/unit/household-planning.plan-approval.scale-boundary.test.ts src/tests/unit/household-planning.per-member-servings.scale-boundary.test.ts` passed.
- `npm --prefix frontend run typecheck` passed.
- `npm --prefix frontend run test:unit` fails on pre-existing `frontend/src/tests/unit/household-planning.preference-conflicts.failure-path.test.ts`.
changed files:
- frontend/src/graphql/resolvers/queries/householdQueries.ts
- frontend/src/utils/householdNotificationPreferences.ts
- frontend/src/tests/unit/household-planning.notification-preferences.failure-path.test.ts
- plans/story-board.jsonl
- plans/story-board.md
follow-up stories added: none
known remaining blockers: frontend/src/tests/unit/household-planning.preference-conflicts.failure-path.test.ts still fails in the full unit suite
