story id: story-0419
title: Catalog review queue: scale boundary
owner: fine-dining-monitor
claimedAt: 2026-06-13T23:24:20Z
branch: codex/story-0419-catalog-review-queue-scale-boundary
intended-test-plan: Add a focused scale-boundary node:test for the catalog review queue feedback helper, then run the targeted unit test, `npm --prefix frontend run test:unit`, and `npm --prefix frontend run typecheck`.
files-expected-to-change:
- frontend/src/utils/catalogReviewQueueFeedback.ts
- frontend/src/tests/unit/admin-operations.catalog-review-queue.scale-boundary.test.ts
outcome: done
verification:
- `NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npm exec -- tsx --test src/tests/unit/admin-operations.catalog-review-queue.scale-boundary.test.ts`
- `npm run typecheck`
- `npm run test:unit` failed on pre-existing `household-planning.preference-conflicts.failure-path.test.ts`
- `npm run test:playwright` failed with EACCES on `frontend/test-results-new` and `frontend/playwright-report`
changed-files:
- frontend/src/utils/catalogReviewQueueFeedback.ts
- frontend/src/tests/unit/admin-operations.catalog-review-queue.scale-boundary.test.ts
follow-up-stories-added: none
runtime: 2026-06-13T23:26:59Z
