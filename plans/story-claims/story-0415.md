story id: story-0415
title: Catalog review queue: contract coverage
owner: fine-dining-monitor
claimedAt: 2026-06-13T22:05:20Z
branch: codex/story-0415-catalog-review-queue-contract-coverage
model: GPT-5
reasoningEffort: medium
intendedTestPlan:
- Add a focused contract test for the restaurant crawler run payload and its typed validation.
- Run the focused unit test first.
- Run `npm --prefix frontend run test:unit`.
- Run `npm --prefix frontend run typecheck`.
filesExpectedToChange:
- frontend/src/pages/admin/crawler.tsx
- frontend/src/components/legacy/Dashboard/CrawlerControlPanel.tsx
- frontend/src/utils/restaurantCrawlerRun.ts
- frontend/src/tests/unit/admin-operations.catalog-review-queue.contract-coverage.test.ts
- plans/story-board.jsonl

## Completion

outcome: done
verification:
- `NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npm exec -- tsx --test src/tests/unit/admin-operations.catalog-review-queue.contract-coverage.test.ts`
- `npm --prefix frontend run typecheck`
- `npm --prefix frontend run test:unit` (failed on unrelated `household-planning.preference-conflicts.failure-path.test.ts`)
changedFiles:
- frontend/src/pages/admin/crawler.tsx
- frontend/src/components/legacy/Dashboard/CrawlerControlPanel.tsx
- frontend/src/utils/restaurantCrawlerRun.ts
- frontend/src/tests/unit/admin-operations.catalog-review-queue.contract-coverage.test.ts
- plans/story-board.jsonl
- plans/story-board.md
followUpStories:
- none
