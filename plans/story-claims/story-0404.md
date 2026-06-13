story id: story-0404
title: Notification preferences: contract coverage
owner: fine-dining-monitor
claimedAt: 2026-06-13T19:29:16Z
completedAt: 2026-06-13T19:39:32Z
branch: codex/story-0404-notification-preferences-contract-coverage
model: GPT-5
outcome: done

verification:
- `NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npm exec -- tsx --test src/tests/unit/household-planning.notification-preferences.contract-coverage.test.ts` passed.
- `npm run typecheck` passed.
- `npm run test:unit` still fails in the preexisting `household-planning.preference-conflicts.failure-path.test.ts`.

changedFiles:
- frontend/src/utils/householdNotificationPreferences.ts
- frontend/src/tests/unit/household-planning.notification-preferences.contract-coverage.test.ts
- plans/story-board.jsonl
- plans/story-board.md
- plans/story-claims/story-0404.md

followUpStoriesAdded: none
