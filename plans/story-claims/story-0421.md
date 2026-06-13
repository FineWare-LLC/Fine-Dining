story id: story-0421
title: Crawler control panel: failure path
owner: fine-dining-monitor
claimedAt: 2026-06-13T23:34:35Z
branch: codex/story-0421-crawler-control-panel-failure-path
intended-test-plan: Add a failing Playwright coverage check for a partial crawler refresh failure on /admin/crawler, then run the targeted Playwright spec, `npm --prefix frontend run test:unit`, and `npm --prefix frontend run typecheck`.
files-expected-to-change:
- frontend/src/components/legacy/Dashboard/CrawlerControlPanel.tsx
- frontend/src/pages/admin/crawler.tsx
- frontend/src/tests/e2e/admin-crawler.failure-path.spec.ts
- plans/story-board.jsonl
- plans/story-board.md
outcome: done
verification:
- `npx playwright test src/tests/e2e/admin-crawler.failure-path.spec.ts --config=playwright.config.js --project=chromium --reporter=line --output=/tmp/pw-admin-crawler-failure`
- `npm --prefix frontend run test:unit`
- `npm --prefix frontend run typecheck`
- `npm --prefix frontend run test:playwright` failed on root-owned report directories
changed-files:
- frontend/src/components/legacy/Dashboard/CrawlerControlPanel.tsx
- frontend/src/pages/admin/crawler.tsx
- frontend/src/tests/e2e/admin-crawler.failure-path.spec.ts
- plans/story-board.jsonl
- plans/story-board.md
follow-up-stories-added: none
runtime: 2026-06-13T23:44:36Z
