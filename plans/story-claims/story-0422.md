story id: story-0422
title: Crawler control panel: persistence consistency
owner: fine-dining-monitor
claimedAt: 2026-06-13T23:44:54Z
branch: codex/story-0422-crawler-control-panel-persistence-consistency
intended-test-plan: Add a focused crawler control panel persistence consistency regression test first, then run the targeted unit test, `npm --prefix frontend run typecheck`, and the crawler persistence Playwright spec.
files-expected-to-change:
- frontend/src/pages/admin/crawler.tsx
- frontend/src/components/legacy/Dashboard/CrawlerControlPanel.tsx
- frontend/src/tests/unit/admin-operations.crawler-control-panel.persistence-consistency.test.ts

## Completion

- outcome: done
- completedAt: 2026-06-13T23:51:51Z
- verification:
  - `npm exec -- tsx --test src/tests/unit/admin-operations.crawler-control-panel.persistence-consistency.test.ts`
  - `npm --prefix frontend run test:unit` failed on pre-existing `household-planning.preference-conflicts.failure-path.test.ts`
  - `npm --prefix frontend run typecheck`
  - `npm exec -- playwright test src/tests/e2e/admin-crawler.persistence.spec.ts --reporter=list --output=/tmp/playwright-output-codex`
- changedFiles:
  - frontend/src/components/legacy/Dashboard/CrawlerControlPanel.tsx
  - frontend/src/pages/admin/crawler.tsx
  - frontend/src/tests/unit/admin-operations.crawler-control-panel.persistence-consistency.test.ts
  - plans/story-board.jsonl
  - plans/story-board.md
  - plans/story-claims/story-0422.md
- followUpStoriesAdded: none
