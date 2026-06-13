story id: story-0408
title: Notification preferences: scale boundary
owner: fine-dining-monitor
claimedAt: 2026-06-13T20:43:15Z
branch: codex/story-0408-notification-preferences-scale-boundary
outcome: done
completedAt: 2026-06-13T20:46:20Z
intendedTestPlan:
- Add a focused scale-boundary regression test for household notification preferences.
- Run the targeted unit test first.
- Run `npm --prefix frontend run test:unit`.
- Run `npm --prefix frontend run typecheck`.
filesExpectedToChange:
- frontend/src/graphql/resolvers/queries/householdQueries.ts
- frontend/src/models/Household/householdSchema.ts
- frontend/src/graphql/resolvers/mutations/householdMutations.ts
- frontend/src/utils/householdNotificationPreferences.ts
- frontend/src/tests/unit/household-planning.notification-preferences.scale-boundary.test.ts
- plans/story-board.jsonl
verification:
- `npm exec -- tsx --test src/tests/unit/household-planning.notification-preferences.scale-boundary.test.ts`
- `npm exec -- tsx --test src/tests/unit/household-planning.notification-preferences.contract-coverage.test.ts src/tests/unit/household-planning.notification-preferences.failure-path.test.ts src/tests/unit/household-planning.notification-preferences.persistence-consistency.test.ts src/tests/unit/household-planning.notification-preferences.operator-feedback.test.ts src/tests/unit/household-planning.notification-preferences.scale-boundary.test.ts`
- `npm run test:unit` (fails on pre-existing `household-planning.preference-conflicts.failure-path.test.ts`)
- `npm run typecheck`
changedFiles:
- frontend/src/tests/unit/household-planning.notification-preferences.scale-boundary.test.ts
- frontend/src/utils/householdNotificationPreferences.ts
- plans/story-board.jsonl
- plans/story-board.md
- plans/story-claims/story-0408.md
followUpStoriesAdded: none
