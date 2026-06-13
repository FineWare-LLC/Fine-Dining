story-id: story-0418
title: Catalog review queue: operator feedback
owner: fine-dining-monitor
claimedAt: 2026-06-13T23:05:39Z
branch: codex/story-0418-catalog-review-queue-operator-feedback
intended-test-plan: Add focused node:test coverage for the catalog review queue feedback state and page integration, then run `npm --prefix frontend run test:unit` and `npm --prefix frontend run typecheck`.
files-expected-to-change:
- frontend/src/utils/catalogReviewQueueFeedback.ts
- frontend/src/components/legacy/Dashboard/CrawlerControlPanel.tsx
- frontend/src/tests/unit/admin-operations.catalog-review-queue.operator-feedback.test.ts
outcome: done
verification:
- `npx tsx --test src/tests/unit/admin-operations.catalog-review-queue.operator-feedback.test.ts`
- `npm --prefix frontend run typecheck`
- `npx playwright test src/tests/e2e/admin-crawler.persistence.spec.ts --reporter=line --output=playwright-output-codex`
- `npm --prefix frontend run test:unit` failed on pre-existing `household-planning.preference-conflicts.failure-path.test.ts`
- `npm --prefix frontend run test:playwright` failed because root-owned `frontend/test-results-new` and `frontend/playwright-report` are not writable
changed-files:
- frontend/src/utils/catalogReviewQueueFeedback.ts
- frontend/src/components/legacy/Dashboard/CrawlerControlPanel.tsx
- frontend/src/tests/unit/admin-operations.catalog-review-queue.operator-feedback.test.ts
follow-up-stories-added: none
runtime: 2026-06-13T23:10:35Z
