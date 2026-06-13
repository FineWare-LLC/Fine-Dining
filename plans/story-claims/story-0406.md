story id: story-0406
title: Notification preferences: persistence consistency
owner: fine-dining-monitor
claimedAt: 2026-06-13T20:22:54Z
branch: codex/story-0406-notification-preferences-persistence-consistency
model: GPT-5
reasoningEffort: medium
intendedTestPlan:
- Add a focused persistence-consistency regression test for notification preferences.
- Run the targeted notification-preferences unit test first.
- Run npm --prefix frontend run test:unit.
- Run npm --prefix frontend run typecheck.
filesExpectedToChange:
- frontend/src/graphql/resolvers/queries/householdQueries.ts
- frontend/src/models/Household/householdSchema.ts
- frontend/src/graphql/resolvers/mutations/householdMutations.ts
- frontend/src/tests/unit/household-planning.notification-preferences.persistence-consistency.test.ts
- plans/story-board.jsonl
- plans/story-board.md

## Completion

- outcome: done
- completedAt: 2026-06-13T20:30:40Z
- verification:
  - `NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npm exec -- tsx --test src/tests/unit/household-planning.notification-preferences.contract-coverage.test.ts src/tests/unit/household-planning.notification-preferences.failure-path.test.ts src/tests/unit/household-planning.notification-preferences.persistence-consistency.test.ts src/tests/unit/household-planning.shopping-ownership.scale-boundary.test.ts src/tests/unit/household-planning.plan-approval.scale-boundary.test.ts`
  - `npm run typecheck`
  - `npm run test:unit` fails on pre-existing `frontend/src/tests/unit/household-planning.preference-conflicts.failure-path.test.ts`
- changedFiles:
  - frontend/src/graphql/resolvers/mutations/householdMutations.ts
  - frontend/src/tests/unit/household-planning.notification-preferences.persistence-consistency.test.ts
  - plans/story-board.jsonl
  - plans/story-board.md
  - plans/story-claims/story-0406.md
- followUpStoriesAdded: none
