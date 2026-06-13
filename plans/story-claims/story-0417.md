story id: story-0417
title: Catalog review queue: persistence consistency
owner: fine-dining-monitor
claimedAt: 2026-06-13T22:25:17Z
branch: codex/story-0417-catalog-review-queue-persistence-consistency
intended test plan: add a persistence-consistency unit test for the crawler draft state, then run the focused unit test, frontend typecheck, and nearby admin/crawler verification
files expected to change: frontend/src/utils/restaurantCrawlerRun.ts, frontend/src/pages/admin/crawler.tsx, frontend/src/tests/unit/admin-operations.catalog-review-queue.persistence-consistency.test.ts, plans/story-board.jsonl
outcome: done
completedAt: 2026-06-13T22:41:55Z
verification:
- NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs ./node_modules/.bin/tsx --test src/tests/unit/admin-operations.catalog-review-queue.persistence-consistency.test.ts
- npm run typecheck
- ./node_modules/.bin/playwright test src/tests/e2e/admin-crawler.persistence.spec.ts --reporter=list --output=playwright-output-codex
changed files:
- frontend/src/utils/restaurantCrawlerRun.ts
- frontend/src/components/legacy/Dashboard/CrawlerControlPanel.tsx
- frontend/src/pages/admin/crawler.tsx
- frontend/src/tests/unit/admin-operations.catalog-review-queue.persistence-consistency.test.ts
- frontend/src/tests/e2e/admin-crawler.persistence.spec.ts
- plans/story-board.jsonl
- plans/story-board.md
follow-up stories added: none
